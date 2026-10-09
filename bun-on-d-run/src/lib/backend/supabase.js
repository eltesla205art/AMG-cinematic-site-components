// Supabase backend. Loaded only when VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
// are set. Tables, security rules and RPCs are defined in supabase/schema.sql.
import { createClient } from '@supabase/supabase-js'
import { DEFAULT_INFO } from '../../data/business'
import { DEFAULT_MENU } from '../../data/menu'

const sb = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY, {
  auth: { persistSession: true, storageKey: 'bod.auth' },
})

const MENU_FIELDS = ['id', 'category', 'name', 'description', 'price', 'image', 'available', 'featured', 'custom', 'sort']

function friendly(error) {
  const msg = error?.message || String(error)
  if (/fetch|network/i.test(msg)) return new Error("Can't reach the server. Check your connection and try again.")
  return new Error(msg)
}

// Active fetchers per table, so our own writes refresh the screen immediately
// instead of waiting on Realtime (which may lag, drop, or not be enabled).
const fetchers = new Map()
const refresh = (table) => fetchers.get(table)?.forEach((run) => run())

/**
 * Fetch now, then refetch whenever Realtime reports a change to `table`, after
 * our own writes, when the tab regains focus, and every `poll` ms if given.
 */
function live(table, fetcher, cb, { poll } = {}) {
  let stopped = false
  const run = async () => {
    try {
      const data = await fetcher()
      if (!stopped) cb({ data })
    } catch (err) {
      if (!stopped) cb({ error: friendly(err) })
    }
  }
  run()
  if (!fetchers.has(table)) fetchers.set(table, new Set())
  fetchers.get(table).add(run)
  const channel = sb
    .channel(`${table}-${Math.random().toString(36).slice(2)}`)
    .on('postgres_changes', { event: '*', schema: 'public', table }, run)
    .subscribe()
  const timer = poll ? setInterval(run, poll) : null
  const onVisible = () => document.visibilityState === 'visible' && run()
  document.addEventListener('visibilitychange', onVisible)
  return () => {
    stopped = true
    fetchers.get(table).delete(run)
    clearInterval(timer)
    document.removeEventListener('visibilitychange', onVisible)
    sb.removeChannel(channel)
  }
}

const must = ({ data, error }) => {
  if (error) throw error
  return data
}

// ---------------------------------------------------------------- auth
async function staffSession(user) {
  if (!user) return null
  const row = must(await sb.from('staff').select('name').eq('user_id', user.id).maybeSingle())
  return row ? { id: user.id, email: user.email, name: row.name } : null
}

export async function signIn(email, password) {
  const { data, error } = await sb.auth.signInWithPassword({ email: email.trim(), password })
  if (error) throw new Error(error.status === 400 ? 'Wrong email or password.' : friendly(error).message)
  const session = await staffSession(data.user)
  if (!session) {
    await sb.auth.signOut()
    throw new Error("This account isn't set up as staff yet. Ask your web manager to add it.")
  }
  return session
}

export async function getSession() {
  const { data } = await sb.auth.getSession()
  try {
    return await staffSession(data.session?.user)
  } catch {
    return null
  }
}

export async function signOut() {
  await sb.auth.signOut()
}

// ---------------------------------------------------------------- menu + info
export const subscribeMenu = (cb) =>
  live('menu_items', async () => {
    const rows = must(await sb.from('menu_items').select(MENU_FIELDS.join(',')).order('sort').order('name'))
    return rows.map((r) => ({ ...r, price: Number(r.price) }))
  }, cb)

export const subscribeInfo = (cb) =>
  live('store_info', async () => {
    const row = must(await sb.from('store_info').select('data').eq('id', 1).maybeSingle())
    return row?.data || DEFAULT_INFO
  }, cb)

export async function saveMenuItem(item) {
  const row = Object.fromEntries(MENU_FIELDS.filter((k) => k in item).map((k) => [k, item[k]]))
  must(await sb.from('menu_items').upsert(row))
  refresh('menu_items')
}

export async function deleteMenuItem(id) {
  must(await sb.from('menu_items').delete().eq('id', id))
  refresh('menu_items')
}

export async function resetMenu() {
  const ids = DEFAULT_MENU.map((m) => m.id)
  must(await sb.from('menu_items').delete().not('id', 'in', `(${ids.join(',')})`))
  must(await sb.from('menu_items').upsert(DEFAULT_MENU.map((m, i) => ({
    ...Object.fromEntries(MENU_FIELDS.map((k) => [k, m[k] ?? (k === 'image' ? '' : false)])),
    sort: (i + 1) * 10,
  }))))
  refresh('menu_items')
}

export async function saveInfo(info) {
  must(await sb.from('store_info').update({ data: info }).eq('id', 1))
  refresh('store_info')
}

// ---------------------------------------------------------------- orders
const toOrder = (r) => r && {
  id: r.id,
  createdAt: Date.parse(r.created_at),
  customer: r.customer,
  pickup: r.pickup,
  lines: r.lines.map((l) => ({ ...l, price: Number(l.price) })),
  totals: Object.fromEntries(Object.entries(r.totals).map(([k, v]) => [k, Number(v)])),
  payment: r.payment,
  status: r.status,
  history: r.history,
}

/** Prices are recomputed in the database; only ids, quantities and builder selections are sent. */
export async function placeOrder({ customer, pickup, lines }) {
  const { data, error } = await sb.rpc('place_order', {
    p_customer: customer,
    p_pickup: pickup,
    p_lines: lines.map((l) => ({ itemId: l.itemId, qty: l.qty, selection: l.selection || undefined })),
  })
  if (error) {
    const sold = /^UNAVAILABLE:(.*)$/.exec(error.message)
    if (sold) throw new Error(`${sold[1]} just sold out. Remove it from your cart and try again.`)
    throw friendly(error)
  }
  return data // { id, token }
}

export async function setOrderStatus(id, status) {
  const { error } = await sb.rpc('set_order_status', { p_id: id, p_status: status })
  if (error) throw friendly(error)
  refresh('orders')
}

export const subscribeOrders = (cb) =>
  live('orders', async () => {
    const rows = must(await sb.from('orders').select('*').order('created_at', { ascending: false }).limit(300))
    return rows.map(toOrder)
  }, cb, { poll: 15_000 }) // backstop so new orders still show up if Realtime is off

/** Customers can't subscribe to the orders table, so poll get_order with their token. */
export function subscribeOrder(id, token, cb) {
  let stopped = false
  const run = async () => {
    if (!token) return cb({ data: null })
    const { data, error } = await sb.rpc('get_order', { p_id: id, p_token: token })
    if (stopped) return
    if (error && !/uuid/i.test(error.message)) cb({ error: friendly(error) })
    else cb({ data: toOrder(data) })
  }
  run()
  const t = setInterval(run, 5000)
  const onVisible = () => document.visibilityState === 'visible' && run()
  document.addEventListener('visibilitychange', onVisible)
  return () => {
    stopped = true
    clearInterval(t)
    document.removeEventListener('visibilitychange', onVisible)
  }
}

// ---------------------------------------------------------------- activity
export const subscribeActivity = (cb) =>
  live('activity_log', async () => {
    const rows = must(await sb.from('activity_log').select('id,at,user_name,action').order('at', { ascending: false }).limit(300))
    return rows.map((r) => ({ id: r.id, at: Date.parse(r.at), user: r.user_name, action: r.action }))
  }, cb)

/** Who did it is filled in by the database from the signed-in account. */
export async function logActivity(action) {
  must(await sb.from('activity_log').insert({ action }))
  refresh('activity_log')
}
