import { Suspense, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { ContactShadows, Float } from '@react-three/drei'
import * as THREE from 'three'
import BurgerModel from './BurgerModel'

function Rig({ children, spin, follow }) {
  const ref = useRef()
  useFrame((state, dt) => {
    const g = ref.current
    if (spin) g.rotation.y += dt * 0.35
    if (follow) {
      // Tilt toward the pointer.
      g.rotation.x = THREE.MathUtils.damp(g.rotation.x, 0.15 + state.pointer.y * -0.25, 4, dt)
      g.rotation.z = THREE.MathUtils.damp(g.rotation.z, state.pointer.x * -0.18, 4, dt)
    }
  })
  return <group ref={ref} rotation={[0.15, 0, 0]}>{children}</group>
}

/** Shared canvas for the hero and the builder. */
export default function Scene({ layers, reducedMotion, camera = [0, 1.6, 6.4], scale = 1, drop = false }) {
  const motion = !reducedMotion
  const model = <BurgerModel layers={layers} animate={drop && motion} scale={scale} />
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: camera, fov: 35 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      frameloop={motion ? 'always' : 'demand'}
      onCreated={({ camera: cam }) => cam.lookAt(0, -0.15, 0)}
    >
      <ambientLight intensity={0.55} />
      <hemisphereLight args={['#FFF8E7', '#3a1a0a', 0.6]} />
      <directionalLight position={[4, 6, 4]} intensity={2.1} castShadow shadow-mapSize={[1024, 1024]} />
      <pointLight position={[-4, 1.5, -2]} intensity={30} color="#E10600" />
      <pointLight position={[4, 0.5, -3]} intensity={22} color="#FF6B00" />
      <Suspense fallback={null}>
        <Rig spin={motion} follow={motion}>
          {motion ? <Float speed={1.6} rotationIntensity={0.15} floatIntensity={0.6}>{model}</Float> : model}
        </Rig>
        <ContactShadows position={[0, -1.42 * scale, 0]} opacity={0.6} scale={8} blur={2.4} far={4} />
      </Suspense>
    </Canvas>
  )
}
