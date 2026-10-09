import { Link } from 'react-router-dom'

export default function OrderMissing({ id }) {
  return (
    <div className="mx-auto w-full max-w-xl px-4 py-24 text-center">
      <h1 className="section-title">Off the Track</h1>
      <p className="mt-3 text-cream/70">We couldn't find order <strong>{id}</strong> on this device. Orders are saved in the browser you ordered from.</p>
      <Link to="/order" className="btn-red mt-6">Start a New Order</Link>
    </div>
  )
}
