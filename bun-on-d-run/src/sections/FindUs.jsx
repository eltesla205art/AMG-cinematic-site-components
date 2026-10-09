import SmartImage from '../components/SmartImage'
import { Phone, Pin } from '../components/Icons'
import { IMAGES } from '../data/images'
import { DAYS, fullAddress, mapsQuery } from '../data/business'
import { fmt12, isOpenNow } from '../lib/hours'
import { useInfo } from '../lib/store'
import { isPlaceholder, telHref } from '../lib/format'

export default function FindUs() {
  const [info] = useInfo()
  const q = mapsQuery(info.address)
  const open = isOpenNow(info.hours)
  const today = DAYS[(new Date().getDay() + 6) % 7]

  return (
    <section id="find-us" className="scroll-mt-20 py-16 md:py-24" aria-labelledby="find-title">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <p className="font-display text-2xl tracking-[.2em] text-flame">Pit Stop</p>
        <h2 id="find-title" className="section-title">Find Us</h2>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_1.3fr]">
          <div className="card flex flex-col gap-6 p-6">
            <div>
              <address className="font-display text-4xl not-italic leading-none tracking-wide">
                {info.address.street}<br />{info.address.city}, {info.address.state} {info.address.zip}
              </address>
              <p className="mt-2 text-cream/70">{info.address.note}</p>
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h3 className="font-display text-2xl tracking-wide text-flame">Hours</h3>
                <span className={`rounded-full px-3 py-0.5 text-xs font-bold uppercase ${open ? 'bg-green-500 text-asphalt' : 'bg-white/10 text-cream/70'}`}>{open ? 'Open now' : 'Closed now'}</span>
              </div>
              <table className="mt-2 w-full text-cream/80">
                <tbody>
                  {DAYS.map((d) => {
                    const h = info.hours[d]
                    return (
                      <tr key={d} className={d === today ? 'font-bold text-cream' : ''}>
                        <th scope="row" className="py-0.5 text-left font-medium">{d}</th>
                        <td className="text-right tabular-nums">{h.closed ? 'Closed' : `${fmt12(h.open)} – ${fmt12(h.close)}`}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <div className="mt-auto flex flex-col gap-3 sm:flex-row">
              <a href={`https://www.google.com/maps/dir/?api=1&destination=${q}`} target="_blank" rel="noreferrer" className="btn-red flex-1 text-2xl"><Pin /> Get Directions</a>
              {isPlaceholder(info.phone) ? (
                <span className="btn-dark flex-1 cursor-default text-2xl opacity-60">Phone coming soon</span>
              ) : (
                <a href={telHref(info.phone)} className="btn-ghost flex-1 text-2xl"><Phone /> Call Us</a>
              )}
            </div>
          </div>
          <div className="grid gap-6">
            <iframe
              title={`Map to Bun on D-Run, ${fullAddress(info.address)}`}
              src={`https://www.google.com/maps?q=${q}&output=embed`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="h-[320px] w-full rounded-2xl border border-white/10 grayscale-[.3] md:h-[380px]"
            />
            <SmartImage src={IMAGES.interior} alt="Inside a modern burger joint" className="hidden aspect-[21/9] w-full rounded-2xl md:block" />
          </div>
        </div>
      </div>
    </section>
  )
}
