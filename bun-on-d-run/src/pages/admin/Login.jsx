import { useState } from 'react'
import Logo from '../../components/Logo'
import Checkered from '../../components/Checkered'
import { login } from './auth'

export default function Login({ onLogin }) {
  const [u, setU] = useState('')
  const [p, setP] = useState('')
  const [err, setErr] = useState('')

  function submit(e) {
    e.preventDefault()
    const s = login(u, p)
    if (s) onLogin(s)
    else setErr('Wrong username or password.')
  }

  return (
    <div className="grid min-h-dvh place-items-center px-4">
      <form onSubmit={submit} className="card w-full max-w-sm overflow-hidden">
        <Checkered />
        <div className="space-y-4 p-6">
          <Logo />
          <h1 className="font-display text-4xl tracking-wide">Pit Crew Login</h1>
          <div>
            <label className="label" htmlFor="u">Username</label>
            <input id="u" className="input" value={u} onChange={(e) => setU(e.target.value)} autoComplete="username" autoCapitalize="none" />
          </div>
          <div>
            <label className="label" htmlFor="p">Password</label>
            <input id="p" className="input" type="password" value={p} onChange={(e) => setP(e.target.value)} autoComplete="current-password" />
          </div>
          {err && <p role="alert" className="text-sm text-racing">{err}</p>}
          <button className="btn-red w-full text-2xl">Log In</button>
          <p className="text-xs text-cream/40">Demo accounts: tim / demo123 (owner), manager / demo123 (web manager).</p>
        </div>
      </form>
    </div>
  )
}
