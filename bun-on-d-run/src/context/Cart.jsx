import { createContext, useContext, useMemo, useState } from 'react'
import { KEYS, useStored } from '../lib/storage'
import { useInfo, useMenu } from '../lib/store'

const CartCtx = createContext(null)
export const useCart = () => useContext(CartCtx)

export function CartProvider({ children }) {
  const [lines, setLines] = useStored(KEYS.cart, [])
  const [menu, menuState] = useMenu()
  const [info] = useInfo()
  const [open, setOpen] = useState(false)

  // Drop items the owner 86'd since they were added (once the menu has loaded).
  const available = useMemo(() => {
    if (menuState.loading && !menu.length) return lines
    const ok = new Set(menu.filter((m) => m.available).map((m) => m.id))
    return lines.filter((l) => ok.has(l.itemId))
  }, [lines, menu, menuState.loading])

  const value = useMemo(() => {
    const subtotal = available.reduce((s, l) => s + l.price * l.qty, 0)
    const tax = subtotal * info.taxRate
    return {
      lines: available,
      count: available.reduce((s, l) => s + l.qty, 0),
      totals: { subtotal, tax, total: subtotal + tax },
      open,
      setOpen,
      /** Same item + same options stack into one line. `selection` is the builder's raw toppings. */
      add(item, qty = 1, options, selection) {
        const key = options ? `${item.id}:${options.join('|')}` : item.id
        setLines((ls) => {
          const hit = ls.find((l) => l.key === key)
          if (hit) return ls.map((l) => (l.key === key ? { ...l, qty: l.qty + qty } : l))
          return [...ls, { key, itemId: item.id, name: item.name, price: item.price, image: item.image || '', qty, options: options || null, selection: selection || null }]
        })
      },
      setQty(key, qty) {
        setLines((ls) => (qty <= 0 ? ls.filter((l) => l.key !== key) : ls.map((l) => (l.key === key ? { ...l, qty } : l))))
      },
      clear: () => setLines([]),
    }
  }, [available, info.taxRate, open, setLines])

  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>
}
