import { useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useCart } from '../context/Cart'
import { money } from '../lib/format'
import QtyStepper from './QtyStepper'
import SmartImage from './SmartImage'
import { X } from './Icons'

export function CartTotals({ totals, className = '' }) {
  return (
    <dl className={`space-y-1 text-cream/80 ${className}`}>
      <div className="flex justify-between"><dt>Subtotal</dt><dd className="tabular-nums">{money(totals.subtotal)}</dd></div>
      <div className="flex justify-between"><dt>Tax (est.)</dt><dd className="tabular-nums">{money(totals.tax)}</dd></div>
      <div className="flex justify-between pt-2 font-display text-3xl tracking-wide text-cream"><dt>Total</dt><dd className="tabular-nums">{money(totals.total)}</dd></div>
    </dl>
  )
}

export default function CartDrawer() {
  const cart = useCart()
  const loc = useLocation()
  const panel = useRef()

  useEffect(() => cart.setOpen(false), [loc]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!cart.open) return
    const prev = document.activeElement
    panel.current?.focus()
    const esc = (e) => e.key === 'Escape' && cart.setOpen(false)
    document.addEventListener('keydown', esc)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', esc)
      document.body.style.overflow = ''
      prev?.focus?.()
    }
  }, [cart.open]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className={`fixed inset-0 z-50 ${cart.open ? '' : 'pointer-events-none'}`} aria-hidden={!cart.open}>
      <div onClick={() => cart.setOpen(false)} className={`absolute inset-0 bg-black/60 transition-opacity ${cart.open ? 'opacity-100' : 'opacity-0'}`} />
      <aside
        ref={panel}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label="Your order"
        className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-asphalt-800 shadow-2xl outline-none transition-transform duration-300 ${cart.open ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex items-center justify-between border-b border-white/10 p-5">
          <h2 className="font-display text-4xl tracking-wide">Your Order</h2>
          <button onClick={() => cart.setOpen(false)} className="rounded-lg p-2 hover:bg-white/10" aria-label="Close cart"><X /></button>
        </div>

        {cart.lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
            <p className="font-display text-4xl tracking-wide text-cream/80">Empty tank.</p>
            <p className="text-cream/60">Nothing on the grid yet. Let's fuel up.</p>
            <Link to="/order" className="btn-red">Browse the Menu</Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-white/10 overflow-y-auto px-5">
              {cart.lines.map((l) => (
                <li key={l.key} className="flex gap-4 py-4">
                  <SmartImage src={l.image} alt={l.name} label="D-Run" className="h-16 w-16 shrink-0 rounded-lg" />
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between gap-2">
                      <p className="font-semibold">{l.name}</p>
                      <p className="tabular-nums">{money(l.price * l.qty)}</p>
                    </div>
                    {l.options && <p className="mt-0.5 text-sm text-cream/60">{l.options.join(', ')}</p>}
                    <div className="mt-2 flex items-center justify-between">
                      <QtyStepper value={l.qty} onChange={(q) => cart.setQty(l.key, q)} label={l.name} />
                      <button onClick={() => cart.setQty(l.key, 0)} className="text-sm text-cream/60 underline hover:text-racing">Remove</button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="border-t border-white/10 p-5">
              <CartTotals totals={cart.totals} />
              <Link to="/checkout" className="btn-red mt-4 w-full text-2xl">Checkout</Link>
            </div>
          </>
        )}
      </aside>
    </div>
  )
}
