import { Link } from 'react-router-dom'
import SmartImage from '../components/SmartImage'
import { useMenu } from '../lib/store'
import { useCart } from '../context/Cart'
import { useToast } from '../context/Toast'
import { money } from '../lib/format'

export default function MenuGrid() {
  const [menu] = useMenu()
  const cart = useCart()
  const toast = useToast()
  const featured = menu.filter((m) => m.featured && m.available)

  return (
    <section id="menu" className="scroll-mt-20 py-16 md:py-24" aria-labelledby="menu-title">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-display text-2xl tracking-[.2em] text-flame">Starting Grid</p>
            <h2 id="menu-title" className="section-title">The Menu</h2>
          </div>
          <Link to="/order" className="btn-ghost">Full Menu →</Link>
        </div>

        {featured.length === 0 ? (
          <p className="mt-10 text-cream/60">The menu is in the pits. Check back shortly.</p>
        ) : (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((item) => (
              <article key={item.id} className="card group flex flex-col overflow-hidden">
                <SmartImage src={item.image} alt={item.name} className="aspect-[4/3] w-full transition group-hover:scale-[1.02]" />
                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-display text-3xl leading-none tracking-wide">{item.name}</h3>
                    <span className="font-display text-3xl text-flame">{money(item.price)}</span>
                  </div>
                  <p className="mt-2 flex-1 text-cream/70">{item.description}</p>
                  <button
                    onClick={() => { cart.add(item); toast(`${item.name} added!`) }}
                    className="btn-red mt-5 self-start"
                  >
                    Add
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
