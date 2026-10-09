import { KEYS, read, update, write } from './storage'

// Shared status model for the ordering app (customer view) and the owner dashboard.
export const STATUSES = [
  { id: 'new', customer: 'Received', owner: 'New' },
  { id: 'preparing', customer: 'On the Grill', owner: 'Preparing' },
  { id: 'ready', customer: 'Ready for Pickup', owner: 'Ready' },
  { id: 'completed', customer: 'Picked Up', owner: 'Completed' },
]

export const statusIndex = (id) => STATUSES.findIndex((s) => s.id === id)

export function nextOrderNumber() {
  const n = read(KEYS.orderSeq, 1041) + 1
  write(KEYS.orderSeq, n)
  return `BOD-${n}`
}

export function placeOrder({ customer, pickup, lines, totals }) {
  // TODO(production): POST to the orders table (Supabase/Firebase) and use the
  // server-assigned order number; take payment via Stripe/Square before this.
  const now = Date.now()
  const order = {
    id: nextOrderNumber(),
    createdAt: now,
    customer,
    pickup, // { asap: boolean, at: epoch ms }
    lines,
    totals,
    payment: 'pay-at-pickup',
    status: 'new',
    history: [{ status: 'new', at: now, by: 'customer' }],
    simulate: true, // demo: auto-advance on the tracking page until staff touch it
  }
  update(KEYS.orders, [], (orders) => [order, ...orders])
  return order
}

export function setOrderStatus(id, status, by) {
  update(KEYS.orders, [], (orders) =>
    orders.map((o) =>
      o.id === id
        ? { ...o, status, simulate: by === 'demo' ? o.simulate : false, history: [...o.history, { status, at: Date.now(), by }] }
        : o,
    ),
  )
}

// Demo-only progression: Received -> On the Grill after 20s -> Ready after 75s.
// TODO(production): delete this and subscribe to order status over a
// WebSocket / Supabase realtime channel instead.
const DEMO_STEPS = { new: { after: 20_000, to: 'preparing' }, preparing: { after: 75_000, to: 'ready' } }

export function advanceDemo(id) {
  // Re-read so a stale React copy can't re-apply a step or undo a staff change.
  const order = read(KEYS.orders, []).find((o) => o.id === id)
  if (!order?.simulate) return
  const step = DEMO_STEPS[order.status]
  if (step && Date.now() - order.createdAt >= step.after) setOrderStatus(order.id, step.to, 'demo')
}
