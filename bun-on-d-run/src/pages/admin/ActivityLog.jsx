import { useActivity } from '../../lib/store'
import { dateTime } from '../../lib/format'

export default function ActivityLog() {
  const [log] = useActivity()
  return (
    <section aria-labelledby="log-title">
      <h2 id="log-title" className="font-display text-4xl tracking-wide">Activity Log</h2>
      <p className="mt-1 text-cream/60">Every change made from this dashboard, newest first.</p>
      {log.length === 0 ? (
        <div className="card mt-4 p-10 text-center text-cream/60">No changes yet.</div>
      ) : (
        <ol className="card mt-4 divide-y divide-white/10">
          {log.map((e) => (
            <li key={e.id} className="grid gap-1 p-4 sm:grid-cols-[11rem_12rem_1fr]">
              <time className="text-sm text-cream/50" dateTime={new Date(e.at).toISOString()}>{dateTime(e.at)}</time>
              <span className="font-semibold text-flame">{e.user}</span>
              <span>{e.action}</span>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}
