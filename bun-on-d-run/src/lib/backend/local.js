// Demo backend: everything lives in this browser's localStorage. Used when no
// Supabase project is configured, so the whole site can be demoed offline.
// Orders placed here are only visible in this same browser.
import { KEYS, read, update, write } from '../storage'
import { DEFAULT_MENU } from '../../data/menu'
import { DEFAULT_INFO } from '../../data/business'

const CHANGE_EVENT = 'bod:storage'

/** Calls cb({ data }) now and whenever `key` changes in this tab or another. */
function subscribeKey(key, fallback, cb, map = (x) => x) {
  const emit = () => cb({ data: map(read(key, fallback)) })
  const on = (e) => {
    const changed = e.type === 'storage' ? e.key : e.detail?.key
    if (changed === key) emit()
  }
  window.addEventListener('storage', on)
  window.addEventListener(CHANGE_EVENT, on)
  emit()
  return () => {
    window.removeEventListener('storage', on)
    window.removeEventListener(CHANGE_EVENT, on)
  }
}

// ---------------------------------------------------------------- auth
// DEMO ONLY: these credentials ship in the JavaScript bundle. Supabase mode
// replaces them with real Supabase Auth accounts.
const ACCOUNTS = {
  tim: { password: 'demo123', name: 'Tim (Owner)' },
  manager: { password: 'demo123', name: 'Ascension Media Group' },
}
const SESSION = 'bod.session'

export async function signIn(username, password) {
  const id = username.trim().toLowerCase()
  const acct = ACCOUNTS[id]
  if (!acct || acct.password !== password) throw new Error('Wrong username or password.')
  const session = { id, name: acct.name }
  sessionStorage.setItem(SESSION, JSON.stringify(session))
  return session
}

export async function getSession() {
  try {
    return JSON.parse(sessionStorage.getItem(SESSION))
  } catch {
    return null
  }
}

export async function signOut() {
  sessionStorage.removeItem(SESSION)
}

const sessionName = () => {
  try {
    return JSON.parse(sessionStorage.getItem(SESSION))?.name || 'unknown'
  } catch {
    return 'unknown'
  }
}

// ---------------------------------------------------------------- menu + info
export const subscribeMenu = (cb) => subscribeKey(KEYS.menu, DEFAULT_MENU, cb)
export const subscribeInfo = (cb) => subscribeKey(KEYS.info, DEFAULT_INFO, cb)

export async function saveMenuItem(item) {
  update(KEYS.menu, DEFAULT_MENU, (menu) =>
    menu.some((m) => m.id === item.id) ? menu.map((m) => (m.id === item.id ? { ...m, ...item } : m)) : [...menu, item],
  )
}

export async function deleteMenuItem(id) {
  update(KEYS.menu, DEFAULT_MENU, (menu) => menu.filter((m) => m.id !== id))
}

export async function resetMenu() {
  write(KEYS.menu, DEFAULT_MENU)
}

export async function saveInfo(info) {
  write(KEYS.info, info)
}

// ---------------------------------------------------------------- orders
function nextOrderNumber() {
  const n = read(KEYS.orderSeq, 1041) + 1
  write(KEYS.orderSeq, n)
  return `BOD-${n}`
}

/** lines: cart lines (prices come from the cart here; Supabase recomputes them). */
export async function placeOrder({ customer, pickup, lines }) {
  const info = read(KEYS.info, DEFAULT_INFO)
  const subtotal = lines.reduce((s, l) => s + l.price * l.qty, 0)
  const tax = subtotal * (info.taxRate ?? DEFAULT_INFO.taxRate)
  const now = Date.now()
  const order = {
    id: nextOrderNumber(),
    createdAt: now,
    customer,
    pickup: { asap: pickup.asap, at: pickup.asap ? now + 15 * 60_000 : pickup.at },
    lines: lines.map(({ key, itemId, name, price, qty, options }) => ({ key, itemId, name, price, qty, options })),
    totals: { subtotal, tax, total: subtotal + tax },
    payment: 'pay-at-pickup',
    status: 'new',
    history: [{ status: 'new', at: now, by: 'customer' }],
    simulate: true, // demo: auto-advance on the tracking page until staff touch it
  }
  update(KEYS.orders, [], (orders) => [order, ...orders])
  return { id: order.id, token: null }
}

function writeStatus(id, status, by, keepSimulating) {
  update(KEYS.orders, [], (orders) =>
    orders.map((o) =>
      o.id === id
        ? { ...o, status, simulate: keepSimulating ? o.simulate : false, history: [...o.history, { status, at: Date.now(), by }] }
        : o,
    ),
  )
}

export async function setOrderStatus(id, status) {
  writeStatus(id, status, sessionName(), false)
}

export const subscribeOrders = (cb) => subscribeKey(KEYS.orders, [], cb)

// Demo-only progression so the tracking page moves on its own:
// Received -> On the Grill after 20s -> Ready after 75s, until staff change it.
const DEMO_STEPS = { new: { after: 20_000, to: 'preparing' }, preparing: { after: 75_000, to: 'ready' } }

function advanceDemo(id) {
  const order = read(KEYS.orders, []).find((o) => o.id === id)
  if (!order?.simulate) return
  const step = DEMO_STEPS[order.status]
  if (step && Date.now() - order.createdAt >= step.after) writeStatus(id, step.to, 'demo', true)
}

/** The customer's view of one order (token is unused in demo mode). */
export function subscribeOrder(id, _token, cb) {
  const unsub = subscribeKey(KEYS.orders, [], cb, (orders) => orders.find((o) => o.id === id) || null)
  advanceDemo(id)
  const t = setInterval(() => advanceDemo(id), 2000)
  return () => {
    clearInterval(t)
    unsub()
  }
}

// ---------------------------------------------------------------- activity
export const subscribeActivity = (cb) => subscribeKey(KEYS.activity, [], cb)

export async function logActivity(action) {
  update(KEYS.activity, [], (log) => [{ id: crypto.randomUUID(), at: Date.now(), user: sessionName(), action }, ...log].slice(0, 500))
}
