import { useState } from 'react'

/** Lazy image with a shimmer skeleton, and a branded tile if it's missing or fails. */
export default function SmartImage({ src, alt, className = '', label }) {
  const [state, setState] = useState(src ? 'loading' : 'error')
  if (state === 'error') {
    return (
      <div className={`flex items-center justify-center bg-[radial-gradient(circle_at_30%_20%,#2A2A2E,#0A0A0B)] ${className}`} role="img" aria-label={alt}>
        <span className="px-4 text-center font-display text-3xl leading-none tracking-wide text-flame/80">{label || alt}</span>
      </div>
    )
  }
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {state === 'loading' && <div className="skeleton absolute inset-0 rounded-none" />}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={() => setState('ok')}
        onError={() => setState('error')}
        className={`h-full w-full object-cover transition-opacity duration-500 ${state === 'ok' ? 'opacity-100' : 'opacity-0'}`}
      />
    </div>
  )
}
