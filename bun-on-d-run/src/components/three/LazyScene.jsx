import { Component, lazy, Suspense, useEffect, useRef, useState } from 'react'

const Scene = lazy(() => import('./Scene'))

function webglAvailable() {
  try {
    const c = document.createElement('canvas')
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')))
  } catch {
    return false
  }
}

class Boundary extends Component {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}

export function Fallback({ className = '' }) {
  return <img src={`${import.meta.env.BASE_URL}burger-fallback.svg`} alt="Stylized smash burger" className={`mx-auto h-full max-h-[420px] w-auto object-contain ${className}`} />
}

/**
 * Loads Three.js only when the canvas scrolls near the viewport, shows the
 * static burger meanwhile, and falls back to it if WebGL isn't available.
 */
export default function LazyScene(props) {
  const ref = useRef()
  const [visible, setVisible] = useState(false)
  const [gl] = useState(webglAvailable)

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setVisible(true), { rootMargin: '200px' })
    io.observe(ref.current)
    return () => io.disconnect()
  }, [])

  const fallback = <Fallback />
  return (
    <div ref={ref} className="h-full w-full">
      {visible && gl ? (
        <Boundary fallback={fallback}>
          <Suspense fallback={fallback}>
            <Scene {...props} />
          </Suspense>
        </Boundary>
      ) : (
        fallback
      )}
    </div>
  )
}
