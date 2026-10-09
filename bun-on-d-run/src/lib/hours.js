import { DAYS } from '../data/business'

const SLOT_MIN = 15
const ASAP_MIN = 15
const LEAD_MIN = 30 // earliest scheduled slot

const dayName = (d) => DAYS[(d.getDay() + 6) % 7] // JS Sunday=0 -> our Monday-first list

function at(d, hhmm) {
  const [h, m] = hhmm.split(':').map(Number)
  const x = new Date(d)
  x.setHours(h, m, 0, 0)
  return x
}

export function openWindow(hours, d) {
  const h = hours[dayName(d)]
  if (!h || h.closed) return null
  return { open: at(d, h.open), close: at(d, h.close) }
}

export function isOpenNow(hours, now = new Date()) {
  const w = openWindow(hours, now)
  return !!w && now >= w.open && now < w.close
}

/** Pickup slots for today, or the next open day if today is done. */
export function pickupSlots(hours, now = new Date()) {
  const slots = []
  for (let offset = 0; offset < 7 && slots.length === 0; offset++) {
    const day = new Date(now)
    day.setDate(day.getDate() + offset)
    const w = openWindow(hours, day)
    if (!w) continue
    let t = new Date(Math.max(w.open.getTime(), now.getTime() + LEAD_MIN * 60_000))
    t.setMinutes(Math.ceil(t.getMinutes() / SLOT_MIN) * SLOT_MIN, 0, 0)
    while (t < w.close && slots.length < 16) {
      slots.push(t.getTime())
      t = new Date(t.getTime() + SLOT_MIN * 60_000)
    }
  }
  return {
    asap: isOpenNow(hours, now) ? now.getTime() + ASAP_MIN * 60_000 : null,
    slots,
  }
}

export const fmt12 = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number)
  return `${((h + 11) % 12) + 1}${m ? `:${String(m).padStart(2, '0')}` : ''}${h < 12 ? 'am' : 'pm'}`
}

/** Collapse identical consecutive days: "Mon–Sun 11am–9pm". */
export function hoursSummary(hours) {
  const short = (d) => d.slice(0, 3)
  const label = (h) => (h.closed ? 'Closed' : `${fmt12(h.open)}–${fmt12(h.close)}`)
  const out = []
  for (const d of DAYS) {
    const l = label(hours[d])
    const last = out[out.length - 1]
    if (last && last.label === l) last.end = d
    else out.push({ start: d, end: d, label: l })
  }
  return out.map((r) => ({ days: r.start === r.end ? short(r.start) : `${short(r.start)}–${short(r.end)}`, label: r.label }))
}
