import { Minus, Plus } from './Icons'

export default function QtyStepper({ value, onChange, min = 0, label = 'quantity', size = 'md' }) {
  const btn = size === 'lg' ? 'h-12 w-12' : 'h-10 w-10'
  return (
    <div className="inline-flex items-center rounded-lg border border-white/15 bg-asphalt-700">
      <button type="button" className={`${btn} grid place-items-center rounded-l-lg hover:bg-white/10 disabled:opacity-40`} onClick={() => onChange(value - 1)} disabled={value <= min} aria-label={`Decrease ${label}`}>
        <Minus width={18} />
      </button>
      <span className="w-8 text-center font-semibold tabular-nums" aria-live="polite">{value}</span>
      <button type="button" className={`${btn} grid place-items-center rounded-r-lg hover:bg-white/10`} onClick={() => onChange(value + 1)} aria-label={`Increase ${label}`}>
        <Plus width={18} />
      </button>
    </div>
  )
}
