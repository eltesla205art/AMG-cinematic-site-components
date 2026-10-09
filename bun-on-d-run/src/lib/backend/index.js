// Picks the backend once at build time: Supabase when both env vars are set,
// otherwise the localStorage demo. The Supabase client is code-split, so demo
// builds never download it.
import * as local from './local'

export const MODE = import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY ? 'supabase' : 'local'

const remote = MODE === 'supabase' ? import('./supabase') : null

const call = (name) => (MODE === 'supabase' ? (...args) => remote.then((m) => m[name](...args)) : local[name])

// subscribe* return an unsubscribe function synchronously, even while the
// Supabase module is still loading.
const sub = (name) =>
  MODE === 'supabase'
    ? (...args) => {
        let unsub
        let cancelled = false
        remote.then((m) => {
          if (!cancelled) unsub = m[name](...args)
        })
        return () => {
          cancelled = true
          unsub?.()
        }
      }
    : local[name]

export const backend = {
  signIn: call('signIn'),
  getSession: call('getSession'),
  signOut: call('signOut'),
  subscribeMenu: sub('subscribeMenu'),
  subscribeInfo: sub('subscribeInfo'),
  saveMenuItem: call('saveMenuItem'),
  deleteMenuItem: call('deleteMenuItem'),
  resetMenu: call('resetMenu'),
  saveInfo: call('saveInfo'),
  placeOrder: call('placeOrder'),
  setOrderStatus: call('setOrderStatus'),
  subscribeOrders: sub('subscribeOrders'),
  subscribeOrder: sub('subscribeOrder'),
  subscribeActivity: sub('subscribeActivity'),
  logActivity: call('logActivity'),
}
