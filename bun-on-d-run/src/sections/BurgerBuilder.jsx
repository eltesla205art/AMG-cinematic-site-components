import { useMemo, useState } from 'react'
import LazyScene from '../components/three/LazyScene'
import QtyStepper from '../components/QtyStepper'
import { BASE_PRICE, CLASSIC, INGREDIENTS, builderLabel, builderLayers, builderPrice } from '../data/builder'
import { money } from '../lib/format'
import { useMenu } from '../lib/store'
import { useCart } from '../context/Cart'
import { useToast } from '../context/Toast'
import useReducedMotion from '../lib/useReducedMotion'

export default function BurgerBuilder() {
  const [sel, setSel] = useState(CLASSIC)
  const reduced = useReducedMotion()
  const cart = useCart()
  const toast = useToast()
  const [menu] = useMenu()
  const byo = menu.find((m) => m.id === 'build-your-own')

  const layers = useMemo(() => builderLayers(sel), [sel])
  const price = builderPrice(sel)
  const toggle = (id) => setSel((s) => ({ ...s, [id]: !s[id] }))
  const toppings = INGREDIENTS.filter((i) => !i.kind && !i.group)
  const sauces = INGREDIENTS.filter((i) => i.group === 'Sauces')
  const patty = INGREDIENTS.find((i) => i.id === 'patty')

  function addToOrder() {
    if (!byo?.available) return
    cart.add({ ...byo, name: 'Custom Smash', price }, 1, builderLabel(sel))
    toast('Added! Your custom smash is on the grid.')
  }

  const Chip = ({ ing }) => (
    <button
      type="button"
      onClick={() => toggle(ing.id)}
      aria-pressed={!!sel[ing.id]}
      className={`rounded-full border-2 px-4 py-2.5 text-left font-semibold transition active:scale-95 ${
        sel[ing.id] ? 'border-flame bg-flame text-asphalt' : 'border-white/20 text-cream hover:border-flame'
      }`}
    >
      {sel[ing.id] ? '✓ ' : '+ '}
      {ing.name}
      {ing.price > 0 && <span className="ml-1 opacity-70">+{money(ing.price)}</span>}
    </button>
  )

  return (
    <section id="builder" className="scroll-mt-20 bg-asphalt-800 py-16 md:py-24" aria-labelledby="builder-title">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <p className="font-display text-2xl tracking-[.2em] text-flame">Pit Crew Mode</p>
        <h2 id="builder-title" className="section-title">Build Your Burger</h2>
        <p className="mt-3 max-w-xl text-cream/70">Tap to stack. Every topping drops onto your burger live. Starts at {money(BASE_PRICE)} for a single smash on a toasted bun.</p>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1.1fr_1fr]">
          <div className="relative h-[360px] rounded-3xl bg-[radial-gradient(circle_at_50%_60%,rgba(255,107,0,.18),transparent_60%)] sm:h-[460px]">
            <LazyScene layers={layers} reducedMotion={reduced} drop camera={[0, 1.4, 6.8]} />
          </div>

          <div className="flex flex-col gap-6">
            <div className="card flex items-center justify-between p-4">
              <div>
                <p className="font-semibold">Extra Patties</p>
                <p className="text-sm text-cream/60">+{money(patty.price)} each, up to a triple</p>
              </div>
              <QtyStepper value={sel.patty || 0} onChange={(v) => setSel((s) => ({ ...s, patty: Math.max(0, Math.min(patty.max, v)) }))} label="extra patties" size="lg" />
            </div>

            <fieldset>
              <legend className="mb-3 font-display text-2xl tracking-wide">Toppings</legend>
              <div className="flex flex-wrap gap-2">{toppings.map((i) => <Chip key={i.id} ing={i} />)}</div>
            </fieldset>
            <fieldset>
              <legend className="mb-3 font-display text-2xl tracking-wide">Sauces</legend>
              <div className="flex flex-wrap gap-2">{sauces.map((i) => <Chip key={i.id} ing={i} />)}</div>
            </fieldset>

            <div className="card mt-auto p-5">
              <p className="text-sm text-cream/60">{builderLabel(sel).join(' · ')}</p>
              <div className="mt-3 flex items-center justify-between gap-4">
                <p className="font-display text-5xl tabular-nums tracking-wide" aria-live="polite">{money(price)}</p>
                <button onClick={addToOrder} disabled={!byo?.available} className="btn-red text-2xl">
                  {byo?.available ? 'Add to Order' : 'Builder Paused'}
                </button>
              </div>
              <button onClick={() => setSel({})} className="mt-3 text-sm text-cream/60 underline hover:text-cream">Start from a plain single</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
