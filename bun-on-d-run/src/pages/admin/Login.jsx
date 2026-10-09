import { useState } from 'react'
import Logo from '../../components/Logo'
import Checkered from '../../components/Checkered'
import { backend } from '../../lib/backend'
import { MODE } from '../../lib/store'

export default function Login({ onLogin }) {
  const [u, setU] = useState('')
  const [p, setP] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const real = MODE === 'supabase'

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    setErr('')
    try {
      onLogin(await backend.signIn(u, p))
    } catch (error) {
      setErr(error.message)
      setBusy(false)
    }
  }

  return (
    <div className="grid min-h-dvh place-items-center px-4">
      <form onSubmit={submit} className="card w-full max-w-sm overflow-hidden">
        <Checkered />
        <div className="space-y-4 p-6">
          <Logo />
          <h1 className="font-display text-4xl tracking-wide">Pit Crew Login</h1>
          <div>
            <label className="label" htmlFor="u">{real ? 'Email' : 'Username'}</label>
            <input id="u" className="input" value={u} onChange={(e) => setU(e.target.value)} type={real ? 'email' : 'text'} autoComplete={real ? 'email' : 'username'} autoCapitalize="none" required />
          </div>
          <div>
            <label className="label" htmlFor="p">Password</label>
            <input id="p" className="input" type="password" value={p} onChange={(e) => setP(e.target.value)} autoComplete="current-password" required />
          </div>
          {err && <p role="alert" className="text-sm text-racing">{err}</p>}
          <button className="btn-red w-full text-2xl" disabled={busy}>{busy ? 'Checking…' : 'Log In'}</button>
          {!real && <p className="text-xs text-cream/40">Demo mode. Accounts: tim / demo123 (owner), manager / demo123 (web manager).</p>}
        </div>
      </form>
    </div>
  )
}
