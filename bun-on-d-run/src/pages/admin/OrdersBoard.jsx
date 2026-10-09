import { useEffect, useRef, useState } from 'react'
import { useOrders } from '../../lib/store'
import { backend } from '../../lib/backend'
import { STATUSES, statusIndex } from '../../lib/orders'
import { dateTime, money, telHref, time } from '../../lib/format'

function beep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    ;[0, 0.18].forEach((t) => {
      const o = ctx.createOscillator()
      const g = ctx.createGain()
      o.frequency.value = 880
      g.gain.setValueAtTime(0.25, ctx.currentTime + t)
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + 0.15)
      o.connect(g).connect(ctx.destination)
      o.start(ctx.currentTime + t)
      o.stop(ctx.currentTime + t + 0.16)
    })
  } catch {
    /* sound is a nice-to-have */
  }
}

const STATUS_STYLE = {
  new: 'bg-flame text-asphalt',
  preparing: 'bg-yellow-400 text-asphalt',
  ready: 'bg-green-500 text-asphalt',
  completed: 'bg-white/10 text-cream/60',
}

export default function OrdersBoard({ onNewOrders }) {
  const [orders, { loading, error }] = useOrders()
  const [busy, setBusy] = useState(null)
  const [failure, setFailure] = useState('')
  const [view, setView] = useState('active')
  const [sound, setSound] = useState(true)
  const seen = useRef(null)
  const [fresh, setFresh] = useState(() => new Set())

  // Badge + chime for orders that arrive while the board is open.
  useEffect(() => {
    if (loading) return
    const ids = orders.map((o) => o.id)
    if (seen.current == null) {
      seen.current = new Set(ids)
      return
    }
    const incoming = ids.filter((id) => !seen.current.has(id))
    if (incoming.length) {
      incoming.forEach((id) => seen.current.add(id))
      setFresh((f) => new Set([...f, ...incoming]))
      if (sound) beep()
    }
  }, [orders, loading, sound])

  useEffect(() => onNewOrders?.(fresh.size), [fresh, onNewOrders])

  const list = orders
    .filter((o) => (view === 'active' ? o.status !== 'completed' : o.status === 'completed'))
    .sort((a, b) => b.createdAt - a.createdAt)

  async function move(o, status) {
    setBusy(o.id)
    setFailure('')
    try {
      await backend.setOrderStatus(o.id, status)
      await backend.logActivity(`Order ${o.id}: ${STATUSES[statusIndex(o.status)].owner} → ${STATUSES[statusIndex(status)].owner}`)
      setFresh((f) => { const n = new Set(f); n.delete(o.id); return n })
    } catch (err) {
      setFailure(`Couldn't update ${o.id}: ${err.message}`)
    } finally {
      setBusy(null)
    }
  }

  return (
    <section aria-labelledby="orders-title">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="orders-title" className="font-display text-4xl tracking-wide">Orders</h2>
        <div className="flex items-center gap-2">
          <button onClick={() => setSound((s) => !s)} className="btn-dark py-2 text-lg" aria-pressed={sound}>{sound ? 'Sound on' : 'Sound off'}</button>
          {['active', 'completed'].map((v) => (
            <button key={v} onClick={() => setView(v)} className={`btn py-2 text-lg ${view === v ? 'bg-cream text-asphalt' : 'bg-asphalt-700'}`}>
              {v === 'active' ? 'Active' : 'Completed'}
            </button>
          ))}
        </div>
      </div>

      {failure && <p role="alert" className="mt-4 rounded-lg bg-racing/15 p-3">{failure}</p>}
      {error && <p role="alert" className="mt-4 rounded-lg bg-racing/15 p-3">Live orders are having trouble loading: {error.message}</p>}
      {loading && !orders.length ? (
        <div className="mt-4 grid gap-4 lg:grid-cols-2" aria-busy="true">
          <div className="skeleton h-64" />
          <div className="skeleton h-64" />
        </div>
      ) : list.length === 0 ? (
        <div className="card mt-4 p-10 text-center text-cream/60">
          {view === 'active' ? 'No active orders. Quiet on the track.' : 'No completed orders yet.'}
        </div>
      ) : (
        <ul className="mt-4 grid gap-4 lg:grid-cols-2">
          {list.map((o) => {
            const idx = statusIndex(o.status)
            const next = STATUSES[idx + 1]
            return (
              <li key={o.id} className={`card p-5 ${fresh.has(o.id) ? 'ring-4 ring-flame' : ''}`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-display text-3xl tracking-wide">
                      {o.id} {fresh.has(o.id) && <span className="ml-1 rounded bg-flame px-2 align-middle text-base text-asphalt">NEW</span>}
                    </p>
                    <p className="text-sm text-cream/60">Placed {dateTime(o.createdAt)}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-sm font-bold ${STATUS_STYLE[o.status]}`}>{STATUSES[idx].owner}</span>
                </div>
                <div className="mt-3 grid gap-1 text-cream/90">
                  <p className="text-xl font-semibold">{o.customer.name} · <a href={telHref(o.customer.phone)} className="underline">{o.customer.phone}</a></p>
                  <p>Pickup: <strong>{o.pickup.asap ? `ASAP (~${time(o.pickup.at)})` : time(o.pickup.at)}</strong></p>
                </div>
                <ul className="mt-3 space-y-1 rounded-lg bg-asphalt-700 p-3">
                  {o.lines.map((l) => (
                    <li key={l.key}>
                      <span className="font-semibold">{l.qty} × {l.name}</span>
                      {l.options && <span className="block text-sm text-cream/60">{l.options.join(', ')}</span>}
                    </li>
                  ))}
                </ul>
                {o.customer.notes && <p className="mt-2 rounded-lg bg-flame/15 p-2 text-sm">Note: {o.customer.notes}</p>}
                <div className="mt-4 flex items-center justify-between gap-3">
                  <p className="font-display text-3xl">{money(o.totals.total)}</p>
                  <div className="flex gap-2">
                    {idx > 0 && o.status !== 'completed' && (
                      <button onClick={() => move(o, STATUSES[idx - 1].id)} disabled={busy === o.id} className="btn-dark px-4 text-lg" aria-label={`Move ${o.id} back to ${STATUSES[idx - 1].owner}`}>Back</button>
                    )}
                    {next && <button onClick={() => move(o, next.id)} disabled={busy === o.id} className="btn-red text-xl">{busy === o.id ? 'Saving…' : `Mark ${next.owner}`}</button>}
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
