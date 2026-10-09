// localStorage helpers. The cart and "my orders" always live here (they're per
// device). Menu, info, orders and activity also live here in demo mode; in
// Supabase mode those go through src/lib/backend/supabase.js instead.
import { useEffect, useState, useCallback } from 'react'

export const KEYS = {
  cart: 'bod.cart',
  orders: 'bod.orders',
  orderSeq: 'bod.orderSeq',
  menu: 'bod.menu',
  info: 'bod.info',
  activity: 'bod.activity',
  myOrders: 'bod.myOrders', // { [orderId]: trackToken } (Supabase mode)
}

const CHANGE_EVENT = 'bod:storage'

export function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw == null ? fallback : JSON.parse(raw)
  } catch {
    return fallback
  }
}

export function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (err) {
    console.warn('Could not save', key, err)
  }
  // 'storage' only fires in *other* tabs; this keeps the current tab in sync too.
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: { key } }))
}

export function update(key, fallback, fn) {
  const next = fn(read(key, fallback))
  write(key, next)
  return next
}

/** React state bound to a storage key; updates live across components and tabs. */
export function useStored(key, fallback) {
  const [value, setValue] = useState(() => read(key, fallback))

  useEffect(() => {
    const sync = (e) => {
      const changed = e.type === 'storage' ? e.key : e.detail?.key
      if (changed === key) setValue(read(key, fallback))
    }
    window.addEventListener('storage', sync)
    window.addEventListener(CHANGE_EVENT, sync)
    return () => {
      window.removeEventListener('storage', sync)
      window.removeEventListener(CHANGE_EVENT, sync)
    }
    // fallback is a constant default; re-subscribing on identity change isn't wanted
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  const set = useCallback(
    (next) => write(key, typeof next === 'function' ? next(read(key, fallback)) : next),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key],
  )

  return [value, set]
}
