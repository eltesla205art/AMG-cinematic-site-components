import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import OrderMissing from './OrderMissing'
import { useInfo, useOrders } from '../lib/store'
import { STATUSES, advanceDemo, statusIndex } from '../lib/orders'
import { time } from '../lib/format'
import { fullAddress, mapsQuery } from '../data/business'

const COPY = {
  new: "We've got your order. Engines warming up.",
  preparing: 'Patties are hitting the flat-top. Smash time.',
  ready: 'Checkered flag! Come grab it at the counter.',
  completed: 'Picked up. Thanks for racing with us!',
}

export default function Track() {
  const { orderId } = useParams()
  const [orders] = useOrders()
  const [info] = useInfo()
  const order = orders.find((o) => o.id === orderId)

  // Demo progression; real status changes from the owner dashboard arrive via
  // the storage listener in useOrders().
  // TODO(production): subscribe to this order over a WebSocket / Supabase realtime channel.
  useEffect(() => {
    if (!order?.simulate) return
    advanceDemo(order.id)
    const t = setInterval(() => advanceDemo(order.id), 2000)
    return () => clearInterval(t)
  }, [order?.id, order?.simulate])

  if (!order) return <OrderMissing id={orderId} />

  const steps = STATUSES.filter((s) => s.id !== 'completed')
  const current = statusIndex(order.status)
  const when = (id) => order.history.findLast((h) => h.status === id)?.at

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10">
      <p className="font-display text-2xl tracking-[.2em] text-flame">Live Timing</p>
      <h1 className="section-title">Order {order.id}</h1>
      <p className="mt-3 text-lg text-cream/80" aria-live="polite">{COPY[order.status]}</p>

      <ol className="card mt-8 p-6 sm:p-8">
        {steps.map((s, i) => {
          const done = current >= i
          const active = current === i
          return (
            <li key={s.id} className="relative flex gap-4 pb-8 last:pb-0">
              {i < steps.length - 1 && <span aria-hidden="true" className={`absolute left-[19px] top-10 h-[calc(100%-2.5rem)] w-1 rounded ${current > i ? 'bg-racing' : 'bg-white/10'}`} />}
              <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full border-4 font-display text-xl ${done ? 'border-racing bg-racing text-cream' : 'border-white/15 text-cream/40'} ${active && order.status !== 'ready' ? 'animate-pulse' : ''}`}>
                {done ? '✓' : i + 1}
              </span>
              <div>
                <p className={`font-display text-3xl tracking-wide ${done ? '' : 'text-cream/40'}`}>{s.customer}</p>
                <p className="text-sm text-cream/60">{when(s.id) ? time(when(s.id)) : 'Pending'}</p>
              </div>
            </li>
          )
        })}
      </ol>

      <div className="card mt-6 grid gap-1 p-6">
        <p><span className="text-cream/60">Pickup:</span> <strong>{order.pickup.asap ? `ASAP, around ${time(order.pickup.at)}` : time(order.pickup.at)}</strong></p>
        <p><span className="text-cream/60">Where:</span> {fullAddress(info.address)}</p>
        <a href={`https://www.google.com/maps/dir/?api=1&destination=${mapsQuery(info.address)}`} target="_blank" rel="noreferrer" className="btn-ghost mt-4">Get Directions</a>
      </div>
      <p className="mt-6 text-center text-sm text-cream/50">This page updates on its own. <Link to={`/confirmation/${order.id}`} className="underline">View receipt</Link></p>
    </div>
  )
}
