// TODO(production): DEMO ONLY. These credentials ship in the JavaScript bundle,
// so anyone can read them. Replace with real auth (e.g. Supabase Auth with
// email/password or magic links, plus row-level security on every table)
// before this goes live.
const ACCOUNTS = {
  tim: { password: 'demo123', name: 'Tim (Owner)' },
  manager: { password: 'demo123', name: 'Ascension Media Group' },
}

const KEY = 'bod.session'

export function login(username, password) {
  const acct = ACCOUNTS[username.trim().toLowerCase()]
  if (!acct || acct.password !== password) return null
  const session = { username: username.trim().toLowerCase(), name: acct.name, at: Date.now() }
  sessionStorage.setItem(KEY, JSON.stringify(session))
  return session
}

export function currentSession() {
  try {
    return JSON.parse(sessionStorage.getItem(KEY))
  } catch {
    return null
  }
}

export const logout = () => sessionStorage.removeItem(KEY)
