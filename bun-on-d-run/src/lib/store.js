import { KEYS, read, update, useStored } from './storage'
import { DEFAULT_MENU } from '../data/menu'
import { DEFAULT_INFO } from '../data/business'

export const useMenu = () => useStored(KEYS.menu, DEFAULT_MENU)
export const useOrders = () => useStored(KEYS.orders, [])
export const useActivity = () => useStored(KEYS.activity, [])

export function useInfo() {
  const [info, setInfo] = useStored(KEYS.info, DEFAULT_INFO)
  // Merge so fields added later to DEFAULT_INFO still show up for saved data.
  return [{ ...DEFAULT_INFO, ...info, address: { ...DEFAULT_INFO.address, ...info.address } }, setInfo]
}

export function logActivity(user, action) {
  update(KEYS.activity, [], (log) =>
    [{ id: crypto.randomUUID(), at: Date.now(), user, action }, ...log].slice(0, 500),
  )
}

export const getOrder = (id) => read(KEYS.orders, []).find((o) => o.id === id)
