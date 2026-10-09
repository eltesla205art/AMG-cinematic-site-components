import { Link } from 'react-router-dom'
import Checkered from './Checkered'
import Logo from './Logo'
import { CallButton } from './Nav'
import { useInfo } from '../lib/store'
import { fullAddress } from '../data/business'
import { hoursSummary } from '../lib/hours'

export default function Footer() {
  const [info] = useInfo()
  return (
    <footer className="mt-auto bg-asphalt-800">
      <Checkered />
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 md:grid-cols-4 md:px-8">
        <div className="md:col-span-2">
          <Logo />
          <p className="mt-3 max-w-sm text-cream/70">{info.tagline} Smash burgers built by a Titusville local, on US-1.</p>
        </div>
        <div>
          <h2 className="font-display text-2xl tracking-wide text-flame">Hours</h2>
          <ul className="mt-2 space-y-1 text-cream/80">
            {hoursSummary(info.hours).map((r) => (
              <li key={r.days}><span className="font-semibold">{r.days}</span> {r.label}</li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="font-display text-2xl tracking-wide text-flame">Find Us</h2>
          <address className="mt-2 not-italic text-cream/80">{fullAddress(info.address)}</address>
          <CallButton className="mt-2 text-cream/80" />
          <a href={info.facebook} target="_blank" rel="noreferrer" className="mt-2 block font-semibold text-cream/80 hover:text-flame">Facebook: Bun on D-Run</a>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 text-sm text-cream/50 sm:flex-row md:px-8">
          <span>© {new Date().getFullYear()} Bun on D-Run</span>
          <span>
            Site built &amp; managed by Ascension Media Group · <Link to="/admin" className="hover:text-cream">Staff</Link>
          </span>
        </div>
      </div>
    </footer>
  )
}
