import SmartImage from '../components/SmartImage'
import { IMAGES } from '../data/images'

export default function Story() {
  return (
    <section id="story" className="scroll-mt-20 bg-cream py-16 text-asphalt md:py-24" aria-labelledby="story-title">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 md:grid-cols-2 md:px-8">
        <div className="relative">
          <SmartImage src={IMAGES.hero} alt="Burger patties searing over open flames" className="aspect-[4/5] w-full rounded-3xl shadow-[0_30px_60px_-20px_rgba(10,10,11,.5)] md:aspect-[4/5]" />
          <div className="absolute -bottom-5 -right-3 rotate-3 rounded-xl bg-racing px-5 py-3 font-display text-2xl tracking-wide text-cream shadow-xl sm:-right-6">Built by hand</div>
        </div>
        <div>
          <p className="font-display text-2xl tracking-[.2em] text-racing">Our Story</p>
          <h2 id="story-title" className="section-title">Local Roots. <br />Fast Lane.</h2>
          <div className="mt-6 max-w-prose space-y-4 text-lg leading-relaxed text-asphalt/80">
            <p>Tim Curtis has been a Titusville guy his whole life. He's a blue-collar builder, the kind who'd rather do it himself than wait on somebody else.</p>
            <p>So when it came time to open Bun on D-Run in the old Ice House building on US-1, he didn't hire it out. He built the place with his own two hands.</p>
            <p>The burgers get the same treatment: smashed hard on a hot flat-top for crispy edges and stacked right. Fast, but never cut-rate.</p>
          </div>
          <p className="mt-6 font-display text-3xl tracking-wide">— Tim Curtis, Owner</p>
        </div>
      </div>
    </section>
  )
}
