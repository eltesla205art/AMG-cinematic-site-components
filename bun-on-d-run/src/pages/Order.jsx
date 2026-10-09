import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import SmartImage from '../components/SmartImage'
import QtyStepper from '../components/QtyStepper'
import { Search } from '../components/Icons'
import { CATEGORIES } from '../data/menu'
import { useMenu } from '../lib/store'
import { useCart } from '../context/Cart'
import { useToast } from '../context/Toast'
import { money } from '../lib/format'

function ItemCard({ item }) {
  const [qty, setQty] = useState(1)
  const cart = useCart()
  const toast = useToast()
  return (
    <article className="card flex overflow-hidden sm:flex-col">
      <SmartImage src={item.image} alt={item.name} label={item.name} className="w-28 shrink-0 sm:aspect-[16/10] sm:w-full" />
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-2xl leading-none tracking-wide sm:text-3xl">{item.name}</h3>
          <span className="font-display text-2xl text-flame sm:text-3xl">{item.custom ? `from ${money(item.price)}` : money(item.price)}</span>
        </div>
        <p className="mt-1.5 flex-1 text-sm text-cream/70">{item.description}</p>
        {item.custom ? (
          <Link to="/#builder" className="btn-red mt-4">Customize</Link>
        ) : (
          <div className="mt-4 flex items-center gap-3">
            <QtyStepper value={qty} onChange={setQty} min={1} label={item.name} />
            <button
              className="btn-red flex-1 py-2.5"
              onClick={() => { cart.add(item, qty); toast(`${qty} × ${item.name} added!`); setQty(1) }}
            >
              Add to cart
            </button>
          </div>
        )}
      </div>
    </article>
  )
}

export default function Order() {
  const [menu] = useMenu()
  const [tab, setTab] = useState('all')
  const [q, setQ] = useState('')

  const visible = useMemo(() => {
    const term = q.trim().toLowerCase()
    return menu.filter(
      (m) => m.available && (tab === 'all' || m.category === tab) && (!term || `${m.name} ${m.description}`.toLowerCase().includes(term)),
    )
  }, [menu, tab, q])

  const groups = CATEGORIES.map((c) => ({ ...c, items: visible.filter((m) => m.category === c.id) })).filter((g) => g.items.length)

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-28 pt-8 md:px-8 md:pb-16">
      <p className="font-display text-2xl tracking-[.2em] text-flame">Pickup Orders</p>
      <h1 className="section-title">Order Ahead</h1>
      <p className="mt-2 text-cream/70">Order now, skip the line. Your food is on the grid the moment you check out.</p>

      <div className="sticky top-[60px] z-20 -mx-4 mt-6 bg-asphalt/95 px-4 py-3 backdrop-blur md:static md:mx-0 md:bg-transparent md:px-0">
        <label className="relative block">
          <span className="sr-only">Search the menu</span>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-cream/40" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search burgers, fries, shakes…" className="input pl-11" type="search" />
        </label>
        <div role="tablist" aria-label="Menu categories" className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {[{ id: 'all', name: 'All' }, ...CATEGORIES].map((c) => (
            <button
              key={c.id}
              role="tab"
              aria-selected={tab === c.id}
              onClick={() => setTab(c.id)}
              className={`shrink-0 rounded-full px-5 py-2.5 font-display text-xl tracking-wide transition ${tab === c.id ? 'bg-racing text-cream' : 'bg-asphalt-700 text-cream/80 hover:bg-asphalt-600'}`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {groups.length === 0 ? (
        <div className="card mt-10 p-10 text-center">
          <p className="font-display text-4xl tracking-wide">No matches on this lap.</p>
          <p className="mt-2 text-cream/60">{q ? `Nothing matches "${q}". Try another search.` : 'Nothing available in this category right now.'}</p>
          <button onClick={() => { setQ(''); setTab('all') }} className="btn-ghost mt-5">Reset</button>
        </div>
      ) : (
        groups.map((g) => (
          <section key={g.id} className="mt-10" aria-labelledby={`cat-${g.id}`}>
            <h2 id={`cat-${g.id}`} className="font-display text-4xl tracking-wide">{g.name}</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {g.items.map((item) => <ItemCard key={item.id} item={item} />)}
            </div>
          </section>
        ))
      )}
    </div>
  )
}
