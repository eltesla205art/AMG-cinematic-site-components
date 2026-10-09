import { useState } from 'react'
import SmartImage from '../../components/SmartImage'
import { CATEGORIES, DEFAULT_MENU } from '../../data/menu'
import { useMenu, logActivity } from '../../lib/store'
import { money } from '../../lib/format'

const BLANK = { name: '', description: '', price: '', category: 'burgers', image: '', available: true }

function ItemForm({ initial, onSave, onCancel }) {
  const [f, setF] = useState({ ...initial, price: String(initial.price) })
  const [err, setErr] = useState('')
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))

  function submit(e) {
    e.preventDefault()
    const price = Number(f.price)
    if (!f.name.trim()) return setErr('Name is required.')
    if (!Number.isFinite(price) || price < 0) return setErr('Price must be a number, like 9.99.')
    if (f.image && !/^https?:\/\//.test(f.image)) return setErr('Image must be a full URL starting with https://')
    onSave({ ...f, name: f.name.trim(), description: f.description.trim(), image: f.image.trim(), price: Math.round(price * 100) / 100 })
  }

  return (
    <form onSubmit={submit} className="card grid gap-4 p-5 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <label className="label" htmlFor="m-name">Name</label>
        <input id="m-name" className="input" value={f.name} onChange={set('name')} />
      </div>
      <div className="sm:col-span-2">
        <label className="label" htmlFor="m-desc">Description</label>
        <textarea id="m-desc" className="input min-h-20" value={f.description} onChange={set('description')} />
      </div>
      <div>
        <label className="label" htmlFor="m-price">Price ($)</label>
        <input id="m-price" className="input" inputMode="decimal" value={f.price} onChange={set('price')} />
      </div>
      <div>
        <label className="label" htmlFor="m-cat">Category</label>
        <select id="m-cat" className="input" value={f.category} onChange={set('category')}>
          {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      <div className="sm:col-span-2">
        <label className="label" htmlFor="m-img">Image URL <span className="font-normal text-cream/50">(optional)</span></label>
        <input id="m-img" className="input" value={f.image} onChange={set('image')} placeholder="https://…" />
      </div>
      <label className="flex items-center gap-3 font-semibold">
        <input type="checkbox" checked={f.available} onChange={set('available')} className="h-6 w-6 accent-flame" /> Available
      </label>
      {err && <p role="alert" className="text-sm text-racing sm:col-span-2">{err}</p>}
      <div className="flex gap-3 sm:col-span-2">
        <button className="btn-red flex-1">Save</button>
        <button type="button" onClick={onCancel} className="btn-dark flex-1">Cancel</button>
      </div>
    </form>
  )
}

export default function MenuManager({ user }) {
  const [menu, setMenu] = useMenu()
  const [editing, setEditing] = useState(null) // item id, 'new', or null

  // TODO(production): each of these writes becomes an insert/update/delete on
  // the Supabase (or Firebase) menu_items table.
  function toggle(item) {
    setMenu((m) => m.map((x) => (x.id === item.id ? { ...x, available: !x.available } : x)))
    logActivity(user.name, `${item.available ? "86'd" : 'Brought back'} ${item.name}`)
  }
  function save(item) {
    if (editing === 'new') {
      const id = `${item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString(36)}`
      setMenu((m) => [...m, { ...item, id }])
      logActivity(user.name, `Added menu item ${item.name} (${money(item.price)})`)
    } else {
      const before = menu.find((x) => x.id === editing)
      setMenu((m) => m.map((x) => (x.id === editing ? { ...x, ...item } : x)))
      const changes = ['name', 'description', 'price', 'category', 'image', 'available'].filter((k) => before[k] !== item[k])
      const detail = changes.includes('price') ? ` price ${money(before.price)} → ${money(item.price)}` : ''
      logActivity(user.name, `Edited ${item.name}: ${changes.join(', ') || 'no changes'}${detail}`)
    }
    setEditing(null)
  }
  function remove(item) {
    if (!window.confirm(`Delete "${item.name}" from the menu? This can't be undone.`)) return
    setMenu((m) => m.filter((x) => x.id !== item.id))
    logActivity(user.name, `Deleted menu item ${item.name}`)
  }
  function reset() {
    if (!window.confirm('Reset the whole menu to the original defaults?')) return
    setMenu(DEFAULT_MENU)
    logActivity(user.name, 'Reset menu to defaults')
  }

  return (
    <section aria-labelledby="menu-mgr-title">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="menu-mgr-title" className="font-display text-4xl tracking-wide">Menu</h2>
        <div className="flex gap-2">
          <button onClick={reset} className="btn-dark py-2 text-lg">Reset</button>
          <button onClick={() => setEditing('new')} className="btn-red py-2 text-lg">+ Add Item</button>
        </div>
      </div>
      {editing === 'new' && <div className="mt-4"><ItemForm initial={BLANK} onSave={save} onCancel={() => setEditing(null)} /></div>}

      {CATEGORIES.map((c) => {
        const items = menu.filter((m) => m.category === c.id)
        if (!items.length) return null
        return (
          <div key={c.id} className="mt-6">
            <h3 className="mb-2 font-display text-2xl tracking-wide text-flame">{c.name}</h3>
            <ul className="grid gap-3">
              {items.map((item) =>
                editing === item.id ? (
                  <li key={item.id}><ItemForm initial={item} onSave={save} onCancel={() => setEditing(null)} /></li>
                ) : (
                  <li key={item.id} className={`card flex flex-wrap items-center gap-4 p-3 ${item.available ? '' : 'opacity-60'}`}>
                    <SmartImage src={item.image} alt={item.name} label="—" className="h-16 w-16 shrink-0 rounded-lg" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-lg font-semibold">{item.name}</p>
                      <p className="text-cream/60">{money(item.price)}{item.custom && ' base (builder)'}</p>
                    </div>
                    <div className="flex w-full gap-2 sm:w-auto">
                      <button
                        onClick={() => toggle(item)}
                        aria-pressed={item.available}
                        className={`btn flex-1 px-4 text-lg sm:flex-none ${item.available ? 'bg-green-500 text-asphalt' : 'bg-white/10 text-cream'}`}
                      >
                        {item.available ? 'Available' : "86'd"}
                      </button>
                      <button onClick={() => setEditing(item.id)} className="btn-dark flex-1 px-4 text-lg sm:flex-none">Edit</button>
                      <button onClick={() => remove(item)} className="btn-dark flex-1 px-4 text-lg text-racing sm:flex-none" aria-label={`Delete ${item.name}`}>Delete</button>
                    </div>
                  </li>
                ),
              )}
            </ul>
          </div>
        )
      })}
    </section>
  )
}
