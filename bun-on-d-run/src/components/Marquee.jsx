const WORDS = ['SMASH BURGERS', 'SHAKES', 'FRIES', 'TITUSVILLE, FL', 'ORDER AHEAD']

export default function Marquee() {
  const row = [...WORDS, ...WORDS]
  return (
    <div className="relative -rotate-1 overflow-hidden border-y-4 border-asphalt bg-racing py-3" aria-label="Smash burgers, shakes, fries">
      <div className="flex w-max animate-marquee motion-reduce:animate-none" aria-hidden="true">
        {[0, 1].map((k) => (
          <div key={k} className="flex shrink-0">
            {row.map((w, i) => (
              <span key={i} className="flex items-center whitespace-nowrap px-6 font-display text-4xl tracking-wider text-cream">
                {w}<span className="ml-12 text-flame">•</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
