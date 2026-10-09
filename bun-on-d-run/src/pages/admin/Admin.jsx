import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import Logo from '../../components/Logo'
import Login from './Login'
import Stats from './Stats'
import OrdersBoard from './OrdersBoard'
import MenuManager from './MenuManager'
import InfoEditor from './InfoEditor'
import ActivityLog from './ActivityLog'
import { currentSession, logout } from './auth'
import { logActivity } from '../../lib/store'

const TABS = [
  { id: 'orders', label: 'Orders' },
  { id: 'menu', label: 'Menu' },
  { id: 'info', label: 'Hours & Info' },
  { id: 'log', label: 'Activity' },
]

export default function Admin() {
  const [user, setUser] = useState(currentSession)
  const [tab, setTab] = useState('orders')
  const [newCount, setNewCount] = useState(0)
  const onNewOrders = useCallback((n) => setNewCount(n), [])

  if (!user) {
    return <Login onLogin={(s) => { setUser(s); logActivity(s.name, 'Logged in') }} />
  }

  return (
    <div className="min-h-dvh pb-24 md:pb-10">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-asphalt/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <Logo />
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden text-cream/70 sm:inline">{user.name}</span>
            <Link to="/" className="hidden underline text-cream/70 hover:text-cream sm:inline">View site</Link>
            <button onClick={() => { logActivity(user.name, 'Logged out'); logout(); setUser(null) }} className="btn-dark py-2 text-lg">Log out</button>
          </div>
        </div>
        <nav aria-label="Dashboard" className="mx-auto hidden max-w-6xl gap-2 px-4 pb-3 md:flex">
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} aria-current={tab === t.id ? 'page' : undefined}
              className={`btn py-2 text-xl ${tab === t.id ? 'bg-racing text-cream' : 'bg-asphalt-700 text-cream/80'}`}>
              {t.label}{t.id === 'orders' && newCount > 0 && <span className="rounded-full bg-flame px-2 text-base text-asphalt">{newCount}</span>}
            </button>
          ))}
        </nav>
      </header>

      <main className="mx-auto grid max-w-6xl gap-8 px-4 pt-6">
        <Stats />
        {/* Keep the board mounted so new-order chimes still fire on other tabs. */}
        <div hidden={tab !== 'orders'}><OrdersBoard user={user} onNewOrders={onNewOrders} /></div>
        {tab === 'menu' && <MenuManager user={user} />}
        {tab === 'info' && <InfoEditor user={user} />}
        {tab === 'log' && <ActivityLog />}
      </main>

      {/* Big thumb-reach tab bar on phones */}
      <nav aria-label="Dashboard" className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-white/10 bg-asphalt-800 md:hidden">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} aria-current={tab === t.id ? 'page' : undefined}
            className={`relative py-4 font-display text-lg tracking-wide ${tab === t.id ? 'bg-racing text-cream' : 'text-cream/70'}`}>
            {t.label === 'Hours & Info' ? 'Info' : t.label}
            {t.id === 'orders' && newCount > 0 && <span className="absolute right-3 top-2 rounded-full bg-flame px-1.5 text-xs text-asphalt">{newCount}</span>}
          </button>
        ))}
      </nav>
    </div>
  )
}
