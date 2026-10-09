import { useEffect, useRef, useState } from 'react'
import { DAYS, DEFAULT_INFO } from '../../data/business'
import { useInfo } from '../../lib/store'
import { backend } from '../../lib/backend'
import { isValidPhone } from '../../lib/format'

export default function InfoEditor() {
  const [info, { loading }] = useInfo()
  const [f, setF] = useState(info)
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')
  const [saving, setSaving] = useState(false)

  // Fill the form once the saved info arrives (Supabase loads asynchronously).
  const filled = useRef(!loading)
  useEffect(() => {
    if (!loading && !filled.current) {
      filled.current = true
      setF(info)
    }
  }, [loading, info])

  const setDay = (d, k, v) => setF((x) => ({ ...x, hours: { ...x.hours, [d]: { ...x.hours[d], [k]: v } } }))
  const setAddr = (k) => (e) => setF((x) => ({ ...x, address: { ...x.address, [k]: e.target.value } }))

  async function save(e) {
    e.preventDefault()
    setMsg('')
    if (f.phone && !/^\[.*\]$/.test(f.phone) && !isValidPhone(f.phone)) return setErr('Phone should be a 10-digit number.')
    const bad = DAYS.find((d) => !f.hours[d].closed && f.hours[d].open >= f.hours[d].close)
    if (bad) return setErr(`${bad}: closing time must be after opening time.`)
    setErr('')

    const changed = []
    if (f.phone !== info.phone) changed.push(`phone → ${f.phone}`)
    if (f.facebook !== info.facebook) changed.push('Facebook link')
    if (JSON.stringify(f.address) !== JSON.stringify(info.address)) changed.push('address')
    for (const d of DAYS) if (JSON.stringify(f.hours[d]) !== JSON.stringify(info.hours[d])) changed.push(`${d} hours`)
    if (f.announcement !== info.announcement) changed.push(f.announcement ? `banner → "${f.announcement}"` : 'banner removed')
    if (!changed.length) return setMsg('Nothing changed.')

    setSaving(true)
    try {
      await backend.saveInfo(f)
      await backend.logActivity(`Updated ${changed.join('; ')}`)
      setMsg('Saved. The website is updated.')
    } catch (error) {
      setErr(`Couldn't save: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="skeleton h-96" aria-busy="true" />

  return (
    <form onSubmit={save} className="grid gap-6" aria-labelledby="info-title">
      <h2 id="info-title" className="font-display text-4xl tracking-wide">Hours &amp; Info</h2>

      <div className="card p-5">
        <label className="label" htmlFor="i-banner">Announcement banner (shows across the top of the website; leave empty to hide)</label>
        <input id="i-banner" className="input text-lg" value={f.announcement} onChange={(e) => setF({ ...f, announcement: e.target.value })} placeholder="Now open Sundays!" maxLength={120} />
      </div>

      <div className="card p-5">
        <h3 className="mb-3 font-display text-2xl tracking-wide text-flame">Store Hours</h3>
        <div className="grid gap-3">
          {DAYS.map((d) => (
            <div key={d} className="grid grid-cols-[6.5rem_1fr] items-center gap-3 sm:grid-cols-[8rem_auto_1fr_1fr]">
              <span className="font-semibold">{d}</span>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={f.hours[d].closed} onChange={(e) => setDay(d, 'closed', e.target.checked)} className="h-6 w-6 accent-flame" /> Closed
              </label>
              {!f.hours[d].closed && (
                <>
                  <input aria-label={`${d} open`} type="time" className="input col-start-2 sm:col-start-auto" value={f.hours[d].open} onChange={(e) => setDay(d, 'open', e.target.value)} />
                  <input aria-label={`${d} close`} type="time" className="input col-start-2 sm:col-start-auto" value={f.hours[d].close} onChange={(e) => setDay(d, 'close', e.target.value)} />
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="card grid gap-4 p-5 sm:grid-cols-2">
        <h3 className="font-display text-2xl tracking-wide text-flame sm:col-span-2">Contact &amp; Address</h3>
        <div>
          <label className="label" htmlFor="i-phone">Phone</label>
          <input id="i-phone" className="input" type="tel" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} />
        </div>
        <div>
          <label className="label" htmlFor="i-fb">Facebook URL</label>
          <input id="i-fb" className="input" value={f.facebook} onChange={(e) => setF({ ...f, facebook: e.target.value })} />
        </div>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="i-street">Street</label>
          <input id="i-street" className="input" value={f.address.street} onChange={setAddr('street')} />
        </div>
        <div><label className="label" htmlFor="i-city">City</label><input id="i-city" className="input" value={f.address.city} onChange={setAddr('city')} /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="label" htmlFor="i-state">State</label><input id="i-state" className="input" value={f.address.state} onChange={setAddr('state')} /></div>
          <div><label className="label" htmlFor="i-zip">ZIP</label><input id="i-zip" className="input" value={f.address.zip} onChange={setAddr('zip')} /></div>
        </div>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="i-note">Directions note</label>
          <input id="i-note" className="input" value={f.address.note} onChange={setAddr('note')} />
        </div>
      </div>

      {err && <p role="alert" className="text-racing">{err}</p>}
      {msg && <p role="status" className="text-green-400">{msg}</p>}
      <div className="sticky bottom-0 -mx-4 flex gap-3 bg-asphalt/95 p-4 backdrop-blur sm:static sm:mx-0 sm:bg-transparent sm:p-0">
        <button className="btn-red flex-1 text-2xl" disabled={saving}>{saving ? 'Saving…' : 'Save Changes'}</button>
        <button type="button" onClick={() => { setF({ ...DEFAULT_INFO, phone: f.phone, facebook: f.facebook }); setMsg('Defaults loaded. Press Save to apply.') }} className="btn-dark">Defaults</button>
      </div>
    </form>
  )
}
