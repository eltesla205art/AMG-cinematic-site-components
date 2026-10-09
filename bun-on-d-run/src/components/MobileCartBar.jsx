import { useCart } from '../context/Cart'
import { money } from '../lib/format'

/** Sticky "view cart" bar on phones once something is in the cart. */
export default function MobileCartBar() {
  const cart = useCart()
  if (!cart.count) return null
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-asphalt/95 p-3 backdrop-blur md:hidden">
      <button onClick={() => cart.setOpen(true)} className="btn-red w-full justify-between text-2xl">
        <span>View Order · {cart.count}</span>
        <span className="tabular-nums">{money(cart.totals.subtotal)}</span>
      </button>
    </div>
  )
}
