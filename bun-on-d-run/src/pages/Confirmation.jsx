import { Link, useParams, useSearchParams } from 'react-router-dom'
import Checkered from '../components/Checkered'
import { CartTotals } from '../components/CartDrawer'
import OrderMissing, { OrderLoading } from './OrderMissing'
import { orderPath, orderToken, useCustomerOrder } from '../lib/store'
import { money, time } from '../lib/format'

export default function Confirmation() {
  const { orderId } = useParams()
  const [params] = useSearchParams()
  const token = orderToken(orderId, params.get('t'))
  const { order, loading, error } = useCustomerOrder(orderId, token)
  if (loading && !order) return <OrderLoading />
  if (!order) return <OrderMissing id={orderId} error={error} />

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10">
      <div className="card overflow-hidden">
        <Checkered />
        <div className="p-6 text-center sm:p-10">
          <p className="font-display text-2xl tracking-[.2em] text-flame">Green Flag!</p>
          <h1 className="section-title">Your order is on the grid</h1>
          <p className="mt-4 text-cream/70">Order number</p>
          <p className="font-display text-6xl tracking-wider text-racing">{order.id}</p>
          <p className="mt-4 text-lg">
            Estimated pickup: <strong>{order.pickup.asap ? `~${time(order.pickup.at)} (ASAP)` : time(order.pickup.at)}</strong>
          </p>
          <p className="text-cream/60">Name for pickup: {order.customer.name} · Pay at pickup</p>
          <Link to={orderPath('track', order.id, token)} className="btn-red mt-8 w-full text-3xl sm:w-auto sm:px-12">Track My Order</Link>
        </div>
        <div className="border-t border-white/10 p-6 sm:px-10">
          <h2 className="font-display text-3xl tracking-wide">Receipt</h2>
          <ul className="mt-2 divide-y divide-white/10">
            {order.lines.map((l) => (
              <li key={l.key} className="flex justify-between gap-3 py-3">
                <span>
                  <span className="font-semibold">{l.qty} × {l.name}</span>
                  {l.options && <span className="block text-sm text-cream/60">{l.options.join(', ')}</span>}
                </span>
                <span className="tabular-nums">{money(l.price * l.qty)}</span>
              </li>
            ))}
          </ul>
          <CartTotals totals={order.totals} className="mt-2 border-t border-white/10 pt-3" />
          {order.customer.notes && <p className="mt-4 rounded-lg bg-asphalt-700 p-3 text-sm text-cream/70">Notes: {order.customer.notes}</p>}
        </div>
      </div>
    </div>
  )
}
