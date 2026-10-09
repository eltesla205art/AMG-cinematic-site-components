import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import Logo from './Logo'
import { Bag, Menu, Phone, X } from './Icons'
import { useCart } from '../context/Cart'
import { useInfo } from '../lib/store'
import { isPlaceholder, telHref } from '../lib/format'

const LINKS = [
  { to: '/#menu', label: 'Menu' },
  { to: '/#story', label: 'Our Story' },
  { to: '/#find-us', label: 'Find Us' },
]

export function CallButton({ className = '', compact = false }) {
  const [info] = useInfo()
  if (isPlaceholder(info.phone)) {
    return <span className={`text-sm text-cream/50 ${className}`}>{compact ? '' : 'Phone coming soon'}</span>
  }
  return (
    <a href={telHref(info.phone)} className={`inline-flex items-center gap-2 font-semibold hover:text-flame ${className}`}>
      <Phone /> <span className={compact ? 'sr-only' : ''}>{info.phone}</span>
    </a>
  )
}

export default function Nav() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const cart = useCart()
  const loc = useLocation()

  useEffect(() => setOpen(false), [loc])
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 10)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])

  return (
    <header className={`sticky top-0 z-40 transition-colors ${scrolled || open ? 'bg-asphalt/95 shadow-lg backdrop-blur' : 'bg-asphalt/60 backdrop-blur-sm'}`}>
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-8" aria-label="Main">
        <Logo />
        <div className="hidden items-center gap-7 md:flex">
          {LINKS.map((l) => (
            <Link key={l.to} to={l.to} className="font-display text-xl tracking-wide text-cream/85 hover:text-flame">{l.label}</Link>
          ))}
          <CallButton className="text-cream/85" />
          <button onClick={() => cart.setOpen(true)} className="relative rounded-lg p-2 hover:bg-white/10" aria-label={`Open cart, ${cart.count} items`}>
            <Bag />
            {cart.count > 0 && <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-flame px-1 text-xs font-bold text-asphalt">{cart.count}</span>}
          </button>
          <NavLink to="/order" className="btn-red py-2 text-lg">Order Ahead</NavLink>
        </div>
        <div className="flex items-center gap-1 md:hidden">
          <CallButton compact className="rounded-lg p-2" />
          <button onClick={() => cart.setOpen(true)} className="relative rounded-lg p-2" aria-label={`Open cart, ${cart.count} items`}>
            <Bag />
            {cart.count > 0 && <span className="absolute right-0 top-0 grid h-5 min-w-5 place-items-center rounded-full bg-flame px-1 text-xs font-bold text-asphalt">{cart.count}</span>}
          </button>
          <button onClick={() => setOpen((o) => !o)} className="rounded-lg p-2" aria-expanded={open} aria-controls="mobile-menu" aria-label={open ? 'Close menu' : 'Open menu'}>
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </nav>
      {open && (
        <div id="mobile-menu" className="border-t border-white/10 px-4 pb-6 md:hidden">
          {LINKS.map((l) => (
            <Link key={l.to} to={l.to} className="block border-b border-white/5 py-4 font-display text-3xl tracking-wide">{l.label}</Link>
          ))}
          <div className="mt-5 flex flex-col gap-3">
            <Link to="/order" className="btn-red w-full">Order Ahead</Link>
            <CallButton className="justify-center py-2" />
          </div>
        </div>
      )}
    </header>
  )
}
