import { Link } from 'react-router-dom'

export default function Logo({ className = '' }) {
  return (
    <Link to="/" className={`group flex items-center gap-2 ${className}`} aria-label="Bun on D-Run home">
      <img src="/favicon.svg" alt="" className="h-9 w-9 transition group-hover:-rotate-6" />
      <span className="font-display text-3xl leading-none tracking-wide">
        Bun on <span className="text-racing">D-Run</span>
      </span>
    </Link>
  )
}
