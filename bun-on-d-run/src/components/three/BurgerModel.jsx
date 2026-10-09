import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Every layer is built from primitive geometry, no model files to download.
// `h` is the layer's stack height; layers render with their base at y=0.

const mat = (color, extra = {}) => ({ color, roughness: 0.75, metalness: 0, ...extra })

function wavyDisc(radius, waves, amp, thickness) {
  const shape = new THREE.Shape()
  const n = 96
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * Math.PI * 2
    const r = radius + Math.sin(a * waves) * amp
    const x = Math.cos(a) * r
    const y = Math.sin(a) * r
    i ? shape.lineTo(x, y) : shape.moveTo(x, y)
  }
  const g = new THREE.ExtrudeGeometry(shape, { depth: thickness, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.03, bevelSegments: 2, curveSegments: 64 })
  g.rotateX(-Math.PI / 2)
  return g
}

function BunBottom() {
  return (
    <mesh castShadow receiveShadow position={[0, 0.2, 0]}>
      <cylinderGeometry args={[1.32, 1.22, 0.4, 64]} />
      <meshStandardMaterial {...mat('#D99445')} />
    </mesh>
  )
}

function BunTop() {
  const seeds = useMemo(() => {
    const pts = []
    const golden = Math.PI * (3 - Math.sqrt(5))
    for (let i = 0; i < 46; i++) {
      const y = 1 - (i / 60) * 0.85 // keep seeds on the upper dome
      const r = Math.sqrt(1 - y * y)
      const a = i * golden
      pts.push([Math.cos(a) * r, y, Math.sin(a) * r, a])
    }
    return pts
  }, [])
  return (
    <group>
      <mesh castShadow position={[0, 0.06, 0]}>
        <cylinderGeometry args={[1.36, 1.38, 0.12, 64]} />
        <meshStandardMaterial {...mat('#E9B866')} />
      </mesh>
      <group position={[0, 0.12, 0]} scale={[1.38, 0.82, 1.38]}>
        <mesh castShadow>
          <sphereGeometry args={[1, 64, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial {...mat('#D4892F', { roughness: 0.55 })} />
        </mesh>
        {seeds.map(([x, y, z, a], i) => (
          <mesh key={i} position={[x * 1.005, y * 1.005, z * 1.005]} rotation={[0, a, Math.acos(y)]} scale={[0.045, 0.02, 0.025]}>
            <sphereGeometry args={[1, 8, 6]} />
            <meshStandardMaterial color="#FFF3D6" roughness={0.6} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

function Patty() {
  const geo = useMemo(() => {
    // Smash patty: lumpy, crispy-edged disc.
    const g = new THREE.CylinderGeometry(1.42, 1.45, 0.34, 72, 3)
    const p = g.attributes.position
    const v = new THREE.Vector3()
    for (let i = 0; i < p.count; i++) {
      v.fromBufferAttribute(p, i)
      const a = Math.atan2(v.z, v.x)
      const radial = Math.hypot(v.x, v.z)
      if (radial > 0.01) {
        const k = 1 + 0.035 * Math.sin(a * 7) + 0.025 * Math.sin(a * 13 + 1.3)
        v.x *= k
        v.z *= k
      }
      v.y += 0.02 * Math.sin(v.x * 5) * Math.cos(v.z * 4)
      p.setXYZ(i, v.x, v.y, v.z)
    }
    g.computeVertexNormals()
    return g
  }, [])
  return (
    <mesh castShadow receiveShadow geometry={geo} position={[0, 0.17, 0]}>
      <meshStandardMaterial {...mat('#4A2615', { roughness: 0.95 })} />
    </mesh>
  )
}

function Cheese() {
  const geo = useMemo(() => {
    // Square slice with corners drooping over the patty.
    const g = new THREE.BoxGeometry(2.3, 0.05, 2.3, 24, 1, 24)
    const p = g.attributes.position
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i)
      const z = p.getZ(i)
      const r = Math.hypot(x, z)
      p.setY(i, p.getY(i) - Math.max(0, r - 1.25) * 0.28)
    }
    g.computeVertexNormals()
    return g
  }, [])
  return (
    <mesh castShadow geometry={geo} position={[0, 0.03, 0]} rotation={[0, Math.PI / 4, 0]}>
      <meshStandardMaterial {...mat('#FFB81C', { roughness: 0.4 })} />
    </mesh>
  )
}

function Lettuce() {
  const geo = useMemo(() => wavyDisc(1.5, 11, 0.09, 0.05), [])
  return (
    <mesh castShadow geometry={geo} position={[0, 0.02, 0]}>
      <meshStandardMaterial {...mat('#5FB342', { roughness: 0.6, side: THREE.DoubleSide })} />
    </mesh>
  )
}

function Tomato() {
  return (
    <group position={[0, 0.07, 0]}>
      {[[-0.55, 0.3], [0.55, 0.3], [0, -0.55]].map(([x, z], i) => (
        <mesh key={i} castShadow position={[x, 0, z]}>
          <cylinderGeometry args={[0.62, 0.62, 0.12, 40]} />
          <meshStandardMaterial {...mat('#D7261E', { roughness: 0.35 })} />
        </mesh>
      ))}
    </group>
  )
}

function Bacon() {
  const geo = useMemo(() => {
    const g = new THREE.BoxGeometry(2.7, 0.05, 0.42, 40, 1, 1)
    const p = g.attributes.position
    for (let i = 0; i < p.count; i++) p.setY(i, p.getY(i) + Math.sin(p.getX(i) * 5) * 0.06)
    g.computeVertexNormals()
    return g
  }, [])
  return (
    <group position={[0, 0.08, 0]}>
      {[-0.4, 0.4].map((z, i) => (
        <mesh key={i} castShadow geometry={geo} position={[0, 0, z]} rotation={[0, 0.25 - i * 0.5, 0]}>
          <meshStandardMaterial {...mat('#8C2F1C', { roughness: 0.5 })} />
        </mesh>
      ))}
    </group>
  )
}

function Rings({ color, count, radius, tube, spread }) {
  const items = useMemo(
    () => Array.from({ length: count }, (_, i) => {
      const a = (i / count) * Math.PI * 2 + 0.4
      const d = i === 0 ? 0 : spread
      return [Math.cos(a) * d, Math.sin(a) * d]
    }),
    [count, spread],
  )
  return (
    <group position={[0, tube, 0]}>
      {items.map(([x, z], i) => (
        <mesh key={i} castShadow position={[x, 0, z]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[radius, tube, 10, 32]} />
          <meshStandardMaterial {...mat(color, { roughness: 0.45 })} />
        </mesh>
      ))}
    </group>
  )
}

function Pickles() {
  const items = [[0, 0], [0.75, 0.3], [-0.7, 0.35], [0.2, -0.8], [-0.4, -0.6], [0.7, -0.5]]
  return (
    <group position={[0, 0.03, 0]}>
      {items.map(([x, z], i) => (
        <mesh key={i} castShadow position={[x, 0, z]}>
          <cylinderGeometry args={[0.3, 0.3, 0.05, 24]} />
          <meshStandardMaterial {...mat('#7A9A2E', { roughness: 0.4 })} />
        </mesh>
      ))}
    </group>
  )
}

function Sauce({ color }) {
  const geo = useMemo(() => wavyDisc(1.25, 9, 0.12, 0.02), [])
  return (
    <mesh geometry={geo} position={[0, 0.005, 0]}>
      <meshStandardMaterial {...mat(color, { roughness: 0.2 })} />
    </mesh>
  )
}

const LAYERS = {
  bunBottom: { h: 0.4, C: BunBottom },
  patty: { h: 0.34, C: Patty },
  cheese: { h: 0.05, C: Cheese },
  bacon: { h: 0.14, C: Bacon },
  onion: { h: 0.08, C: () => <Rings color="#EDE3F2" count={5} radius={0.42} tube={0.04} spread={0.8} /> },
  pickles: { h: 0.06, C: Pickles },
  jalapenos: { h: 0.07, C: () => <Rings color="#3E8B2E" count={7} radius={0.17} tube={0.035} spread={0.85} /> },
  tomato: { h: 0.14, C: Tomato },
  lettuce: { h: 0.08, C: Lettuce },
  ketchup: { h: 0.03, C: () => <Sauce color="#B3170F" /> },
  mustard: { h: 0.03, C: () => <Sauce color="#E8B400" /> },
  drun: { h: 0.03, C: () => <Sauce color="#F07A1A" /> },
  bunTop: { h: 1.3, C: BunTop },
}

const typeOf = (id) => id.replace(/\d+$/, '')

function Layer({ id, y, animate }) {
  const ref = useRef()
  const { C } = LAYERS[typeOf(id)]
  useFrame((_, dt) => {
    const g = ref.current
    if (!g) return
    if (!animate) {
      g.position.y = y
      return
    }
    // Ease toward target: new layers drop in from above, others settle when the stack changes.
    g.position.y = THREE.MathUtils.damp(g.position.y, y, 9, dt)
  })
  return (
    <group ref={ref} position={[0, animate ? y + 3 : y, 0]}>
      <C />
    </group>
  )
}

const FIT_HEIGHT = 2.8 // world units the whole burger is scaled to fit within

/** layers: bottom-to-top ids, e.g. ['bunBottom','patty0','cheese0','bunTop']. */
export default function BurgerModel({ layers, animate = true, ...props }) {
  const fitRef = useRef()
  let y = 0
  const placed = layers.map((id) => {
    const at = y
    y += LAYERS[typeOf(id)].h
    return { id, y: at }
  })
  const fit = Math.min(1, FIT_HEIGHT / y)
  const offset = -1.4 // burger base sits here regardless of height

  useFrame((_, dt) => {
    const g = fitRef.current
    if (!g) return
    const s = animate ? THREE.MathUtils.damp(g.scale.x, fit, 6, dt) : fit
    g.scale.setScalar(s)
  })

  return (
    <group {...props}>
      <group position={[0, offset, 0]}>
        <group ref={fitRef} scale={fit}>
          {placed.map((l) => (
            <Layer key={l.id} id={l.id} y={l.y} animate={animate} />
          ))}
        </group>
      </group>
    </group>
  )
}
