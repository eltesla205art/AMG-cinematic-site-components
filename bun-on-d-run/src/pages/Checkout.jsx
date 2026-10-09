import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/Cart'
import { CartTotals } from '../components/CartDrawer'
import { orderPath, rememberOrder, useInfo } from '../lib/store'
import { backend } from '../lib/backend'
import { pickupSlots } from '../lib/hours'
import { isValidPhone, money, time } from '../lib/format'

// Pickup slots depend on store hours, so the form only mounts once they've loaded.
export default function Checkout() {
  const [info, { loading }] = useInfo()
  if (loading) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 pb-16 pt-8 md:px-8" aria-busy="true">
        <div className="skeleton h-16 w-64" />
        <div className="mt-8 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          <div className="skeleton h-96" />
          <div className="skeleton h-72" />
        </div>
      </div>
    )
  }
  return <CheckoutForm info={info} />
}

function CheckoutForm({ info }) {
  const cart = useCart()
  const navigate = useNavigate()
  const { asap, slots } = useMemo(() => pickupSlots(info.hours), [info.hours])

  const [form, setForm] = useState({ name: '', phone: '', pickup: asap ? 'asap' : String(slots[0] ?? ''), notes: '' })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [failure, setFailure] = useState('')
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  if (cart.lines.length === 0) {
    return (
      <div className="mx-auto w-full max-w-xl px-4 py-24 text-center">
        <h1 className="section-title">Empty Tank</h1>
        <p className="mt-3 text-cream/70">Your cart is empty. Add something before you hit the checkout lane.</p>
        <Link to="/order" className="btn-red mt-6">Browse the Menu</Link>
      </div>
    )
  }

  function validate() {
    const e = {}
    if (!form.name.trim()) e.name = 'We need a name to call out at pickup.'
    if (!isValidPhone(form.phone)) e.phone = 'Enter a 10-digit phone number.'
    if (!form.pickup) e.pickup = 'Pick a pickup time.'
    return e
  }

  async function submit(ev) {
    ev.preventDefault()
    const e = validate()
    setErrors(e)
    if (Object.keys(e).length) {
      document.getElementById(`f-${Object.keys(e)[0]}`)?.focus()
      return
    }
    setSubmitting(true)
    setFailure('')
    try {
      // TODO(payments): wire Stripe or Square here. Create a payment intent
      // server-side, confirm it, and only place the order once payment succeeds.
      // For now every order is "Pay at pickup".
      const isAsap = form.pickup === 'asap'
      const { id, token } = await backend.placeOrder({
        customer: { name: form.name.trim(), phone: form.phone.trim(), notes: form.notes.trim() },
        pickup: isAsap ? { asap: true } : { asap: false, at: Number(form.pickup) },
        lines: cart.lines,
      })
      rememberOrder(id, token)
      cart.clear()
      navigate(orderPath('confirmation', id, token))
    } catch (err) {
      console.error(err)
      setFailure(err?.message || "Something stalled on our end and your order didn't go through. Please try again, or give us a call.")
      setSubmitting(false)
    }
  }

  const noSlots = !asap && slots.length === 0
  const slotDay = slots[0] && new Date(slots[0]).toDateString() !== new Date().toDateString()
    ? new Date(slots[0]).toLocaleDateString([], { weekday: 'long' })
    : null

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-16 pt-8 md:px-8">
      <h1 className="section-title">Checkout</h1>
      <form onSubmit={submit} noValidate className="mt-8 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          <fieldset className="card space-y-4 p-6">
            <legend className="px-1 font-display text-3xl tracking-wide">Pickup Details</legend>
            <div>
              <label className="label" htmlFor="f-name">Name</label>
              <input id="f-name" className="input" value={form.name} onChange={set('name')} autoComplete="name" aria-invalid={!!errors.name} aria-describedby="e-name" />
              {errors.name && <p id="e-name" className="mt-1 text-sm text-racing">{errors.name}</p>}
            </div>
            <div>
              <label className="label" htmlFor="f-phone">Phone</label>
              <input id="f-phone" className="input" value={form.phone} onChange={set('phone')} type="tel" inputMode="tel" autoComplete="tel" placeholder="(321) 555-0123" aria-invalid={!!errors.phone} aria-describedby="e-phone" />
              {errors.phone && <p id="e-phone" className="mt-1 text-sm text-racing">{errors.phone}</p>}
            </div>
            <div>
              <label className="label" htmlFor="f-pickup">Pickup time{slotDay && ` (${slotDay})`}</label>
              {noSlots ? (
                <p className="rounded-lg bg-asphalt-700 p-4 text-cream/70">We're not taking pickup orders this week. Check back soon.</p>
              ) : (
                <select id="f-pickup" className="input" value={form.pickup} onChange={set('pickup')} aria-invalid={!!errors.pickup}>
                  {asap && <option value="asap">ASAP (~15 min)</option>}
                  {slots.map((t) => <option key={t} value={t}>{time(t)}</option>)}
                </select>
              )}
              {!asap && !noSlots && <p className="mt-1 text-sm text-cream/60">We're closed right now, so ASAP isn't available. Schedule a pickup instead.</p>}
              {errors.pickup && <p className="mt-1 text-sm text-racing">{errors.pickup}</p>}
            </div>
            <div>
              <label className="label" htmlFor="f-notes">Order notes <span className="font-normal text-cream/50">(optional)</span></label>
              <textarea id="f-notes" className="input min-h-24" value={form.notes} onChange={set('notes')} placeholder="No onions on the second burger, extra napkins…" maxLength={300} />
            </div>
          </fieldset>

          <fieldset className="card p-6">
            <legend className="px-1 font-display text-3xl tracking-wide">Payment</legend>
            <label className="flex items-center gap-3 rounded-lg border-2 border-flame bg-flame/10 p-4">
              <input type="radio" checked readOnly className="h-5 w-5 accent-flame" />
              <span><span className="font-semibold">Pay at pickup</span><span className="block text-sm text-cream/60">Card or cash at the counter.</span></span>
            </label>
          </fieldset>
        </div>

        <aside className="card h-fit p-6 lg:sticky lg:top-24">
          <h2 className="font-display text-3xl tracking-wide">Your Order</h2>
          <ul className="mt-3 divide-y divide-white/10">
            {cart.lines.map((l) => (
              <li key={l.key} className="flex justify-between gap-3 py-3">
                <span>
                  <span className="font-semibold">{l.qty} × {l.name}</span>
                  {l.options && <span className="block text-sm text-cream/60">{l.options.join(', ')}</span>}
                </span>
                <span className="tabular-nums">{money(l.price * l.qty)}</span>
              </li>
            ))}
          </ul>
          <CartTotals totals={cart.totals} className="mt-3 border-t border-white/10 pt-3" />
          {failure && <p role="alert" className="mt-4 rounded-lg bg-racing/15 p-3 text-sm text-cream">{failure}</p>}
          <button type="submit" disabled={submitting || noSlots} className="btn-red mt-5 w-full text-2xl">
            {submitting ? 'Placing order…' : 'Place Order'}
          </button>
          <button type="button" onClick={() => cart.setOpen(true)} className="mt-3 w-full text-sm text-cream/60 underline hover:text-cream">Edit cart</button>
        </aside>
      </form>
    </div>
  )
}
