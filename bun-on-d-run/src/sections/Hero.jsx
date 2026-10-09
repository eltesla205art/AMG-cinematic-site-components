import { Link } from 'react-router-dom'
import LazyScene from '../components/three/LazyScene'
import { CLASSIC, builderLayers } from '../data/builder'
import useReducedMotion from '../lib/useReducedMotion'

const HERO_LAYERS = builderLayers({ ...CLASSIC, patty: 1 })

export default function Hero() {
  const reduced = useReducedMotion()
  return (
    <section className="relative overflow-hidden" aria-labelledby="hero-title">
      {/* Speed lines + glow */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_70%_45%,rgba(225,6,0,.35),transparent_55%),radial-gradient(ellipse_at_20%_80%,rgba(255,107,0,.18),transparent_50%)]" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-[.07] [background:repeating-linear-gradient(-12deg,#FFF8E7_0_2px,transparent_2px_46px)]" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-4 px-4 pb-10 pt-8 md:grid-cols-2 md:px-8 md:pb-20 md:pt-14">
        <div className="order-2 md:order-1">
          <p className="font-display text-2xl tracking-[.2em] text-flame">Titusville, FL · Opening Soon</p>
          <h1 id="hero-title" className="mt-2 font-display text-[clamp(4rem,11vw,9rem)] leading-[.85] tracking-wide">
            The Fast Lane <span className="block text-racing">of Flavor</span>
          </h1>
          <p className="mt-5 max-w-md text-lg text-cream/80">Smash burgers. Titusville, FL. Crispy edges, melty cheese, and a bun that's been to the pit stop.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#builder" className="btn-red text-2xl">Build Your Burger</a>
            <Link to="/order" className="btn-ghost text-2xl">Order Ahead</Link>
          </div>
        </div>
        <div className="order-1 h-[340px] sm:h-[420px] md:order-2 md:h-[560px]">
          <LazyScene layers={HERO_LAYERS} reducedMotion={reduced} />
        </div>
      </div>
    </section>
  )
}
