import { useOrders } from '../../lib/store'
import { isToday, money } from '../../lib/format'

export default function Stats() {
  const [orders] = useOrders()
  const today = orders.filter((o) => isToday(o.createdAt))
  const revenue = today.reduce((s, o) => s + o.totals.total, 0)
  const counts = {}
  for (const o of today) for (const l of o.lines) counts[l.name] = (counts[l.name] || 0) + l.qty
  const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]

  const Tile = ({ label, value, sub }) => (
    <div className="card p-4">
      <p className="text-sm font-semibold uppercase tracking-wider text-cream/60">{label}</p>
      <p className="mt-1 truncate font-display text-4xl tracking-wide">{value}</p>
      {sub && <p className="text-sm text-cream/50">{sub}</p>}
    </div>
  )
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
      <Tile label="Orders today" value={today.length} />
      <Tile label="Revenue today" value={money(revenue)} sub="incl. tax" />
      <div className="col-span-2 md:col-span-1">
        <Tile label="Top item today" value={top ? top[0] : '—'} sub={top ? `${top[1]} sold` : 'No orders yet'} />
      </div>
    </div>
  )
}
