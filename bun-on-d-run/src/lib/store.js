import { useEffect, useState } from 'react'
import { backend, MODE } from './backend'
import { KEYS, read, update } from './storage'
import { DEFAULT_INFO } from '../data/business'

export { MODE }

/** { data, loading, error } for a backend subscription. */
function useLive(subscribe, args, initial) {
  const [state, setState] = useState({ data: initial, loading: true, error: null })
  useEffect(() => {
    setState((s) => ({ ...s, loading: true }))
    return subscribe(...args, ({ data, error }) =>
      setState((s) => (error ? { ...s, loading: false, error } : { data, loading: false, error: null })),
    )
    // args are primitives (ids/tokens); spreading them is the dependency list
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, args)
  return state
}

export function useMenu() {
  const { data, loading, error } = useLive(backend.subscribeMenu, [], [])
  return [data, { loading, error }]
}

export function useInfo() {
  const { data, loading, error } = useLive(backend.subscribeInfo, [], DEFAULT_INFO)
  // Merge so fields added later to DEFAULT_INFO still show up for saved data.
  const info = { ...DEFAULT_INFO, ...data, address: { ...DEFAULT_INFO.address, ...data?.address }, hours: { ...DEFAULT_INFO.hours, ...data?.hours } }
  return [info, { loading, error }]
}

/** Staff only: every order, live. */
export function useOrders() {
  const { data, loading, error } = useLive(backend.subscribeOrders, [], [])
  return [data, { loading, error }]
}

export function useActivity() {
  const { data, loading, error } = useLive(backend.subscribeActivity, [], [])
  return [data, { loading, error }]
}

// ---------------------------------------------------------------- customer orders
// Supabase mode hands back a secret tracking token with each order. It goes in
// the confirmation/tracking URLs (?t=) and is remembered on this device.

export function rememberOrder(id, token) {
  if (token) update(KEYS.myOrders, {}, (m) => ({ ...m, [id]: token }))
}

export function orderToken(id, fromUrl) {
  return fromUrl || read(KEYS.myOrders, {})[id] || null
}

export function orderPath(kind, id, token) {
  return `/${kind}/${id}${token ? `?t=${token}` : ''}`
}

export function useCustomerOrder(id, token) {
  const { data, loading, error } = useLive(backend.subscribeOrder, [id, token], null)
  return { order: data, loading, error }
}
