import { Link } from 'react-router-dom'
import { MODE } from '../lib/store'

export default function OrderMissing({ id, error }) {
  return (
    <div className="mx-auto w-full max-w-xl px-4 py-24 text-center">
      <h1 className="section-title">{error ? 'Engine Trouble' : 'Off the Track'}</h1>
      <p className="mt-3 text-cream/70">
        {error
          ? `We couldn't load order ${id}: ${error.message}`
          : MODE === 'supabase'
            ? <>We couldn't find order <strong>{id}</strong>. Open it from the link on your confirmation page, or from the device you ordered on.</>
            : <>We couldn't find order <strong>{id}</strong> on this device. Orders are saved in the browser you ordered from.</>}
      </p>
      <Link to="/order" className="btn-red mt-6">Start a New Order</Link>
    </div>
  )
}

export function OrderLoading() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10" aria-busy="true">
      <div className="skeleton h-10 w-48" />
      <div className="skeleton mt-4 h-20 w-80 max-w-full" />
      <div className="skeleton mt-8 h-72" />
    </div>
  )
}
