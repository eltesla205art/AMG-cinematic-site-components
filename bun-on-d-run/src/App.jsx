import { Component } from 'react'
import { Link, Outlet, ScrollRestoration, createBrowserRouter, RouterProvider } from 'react-router-dom'
import Nav from './components/Nav'
import Footer from './components/Footer'
import Announcement from './components/Announcement'
import CartDrawer from './components/CartDrawer'
import MobileCartBar from './components/MobileCartBar'
import Home from './pages/Home'
import Order from './pages/Order'
import Checkout from './pages/Checkout'
import Confirmation from './pages/Confirmation'
import Track from './pages/Track'
import Admin from './pages/admin/Admin'
import { CartProvider } from './context/Cart'
import { ToastProvider } from './context/Toast'

class ErrorBoundary extends Component {
  state = { error: null }
  static getDerivedStateFromError(error) {
    return { error }
  }
  render() {
    if (!this.state.error) return this.props.children
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <h1 className="section-title">Engine Trouble</h1>
        <p className="mt-3 text-cream/70">Something broke on this page. Try reloading. If it keeps happening, give us a call.</p>
        <button onClick={() => window.location.reload()} className="btn-red mt-6">Reload</button>
      </div>
    )
  }
}

function SiteLayout() {
  return (
    <div className="flex min-h-dvh flex-col">
      <Announcement />
      <Nav />
      <main className="flex flex-1 flex-col">
        <ErrorBoundary><Outlet /></ErrorBoundary>
      </main>
      <Footer />
      <CartDrawer />
      <MobileCartBar />
    </div>
  )
}

function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <h1 className="section-title">Wrong Turn</h1>
      <p className="mt-3 text-cream/70">That page isn't on the track.</p>
      <Link to="/" className="btn-red mt-6">Back to the Start</Link>
    </div>
  )
}

function Root() {
  return (
    <ToastProvider>
      <CartProvider>
        <ScrollRestoration getKey={(loc) => loc.pathname} />
        <Outlet />
      </CartProvider>
    </ToastProvider>
  )
}

const router = createBrowserRouter([
  {
    element: <Root />,
    children: [
      {
        element: <SiteLayout />,
        children: [
          { path: '/', element: <Home /> },
          { path: '/order', element: <Order /> },
          { path: '/checkout', element: <Checkout /> },
          { path: '/confirmation/:orderId', element: <Confirmation /> },
          { path: '/track/:orderId', element: <Track /> },
          { path: '*', element: <NotFound /> },
        ],
      },
      { path: '/admin', element: <ErrorBoundary><Admin /></ErrorBoundary> },
    ],
  },
])

export default function App() {
  return <RouterProvider router={router} />
}
