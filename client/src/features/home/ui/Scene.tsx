import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer, ContactShadows } from '@react-three/drei'
import { useRef } from 'react'
import * as THREE from 'three'
import { heroScroll, peekScroll } from '../../../shared/lib/motion'

const { damp } = THREE.MathUtils

type CharProps = { color: string; radius: number; length: number; x: number; lag: number; seed: number; peek?: boolean }

/** A long glossy oval with two blinking eyes that follow the cursor. Click it to make it hop. */
function Demon({ color, radius, length, x, lag, seed, peek }: CharProps) {
  const root = useRef<THREE.Group>(null!)
  const body = useRef<THREE.Group>(null!)
  const eyes = useRef<THREE.Group>(null!)
  const st = useRef({ nextBlink: 1 + seed, blinkT: -1, jumpT: -1, hop: false })
  const half = length / 2 + radius

  useFrame(({ pointer, clock }, dt) => {
    const t = clock.elapsedTime
    const s = st.current
    if (s.hop) { s.hop = false; if (s.jumpT < 0) s.jumpT = t }
    // blink: random interval, sometimes a double blink
    if (t > s.nextBlink) { s.blinkT = t; s.nextBlink = t + 1.8 + Math.random() * 3.2 }
    const bp = t - s.blinkT
    const closed = bp < 0.12 || (seed > 0.5 && bp > 0.22 && bp < 0.32)
    eyes.current.scale.y = damp(eyes.current.scale.y, closed ? 0.08 : 1, 40, dt)

    // look at the cursor
    root.current.rotation.y = damp(root.current.rotation.y, pointer.x * 0.55 - x * 0.08, 3.5, dt)
    root.current.rotation.x = damp(root.current.rotation.x, -pointer.y * 0.25, 3.5, dt)
    eyes.current.position.x = damp(eyes.current.position.x, pointer.x * radius * 0.18, 6, dt)
    eyes.current.position.y = damp(eyes.current.position.y, length * 0.32 + pointer.y * radius * 0.12, 6, dt)

    // hop on click: anticipation squash, airtime, landing squash
    let y = 0, sy = 1 + Math.sin(t * 2 + seed * 5) * 0.015
    if (s.jumpT >= 0) {
      const j = t - s.jumpT
      if (j < 0.12) sy = 1 - j * 1.5
      else if (j < 0.72) { const k = (j - 0.12) / 0.6; y = Math.sin(k * Math.PI) * 1.1; sy = 1.08 }
      else if (j < 0.9) sy = 0.88
      else s.jumpT = -1
    }
    body.current.position.y = damp(body.current.position.y, y, 18, dt)
    body.current.scale.y = damp(body.current.scale.y, sy, 20, dt)
    body.current.scale.x = body.current.scale.z = 1 / Math.sqrt(body.current.scale.y)

    // scroll parallax: each demon drifts at its own speed
    const p = peek ? 0 : heroScroll.p
    root.current.position.y = damp(root.current.position.y, half - 1.6 + p * lag, 6, dt)
    root.current.rotation.z = damp(root.current.rotation.z, p * (x > 0 ? -0.35 : 0.35), 6, dt)
  })

  return (
    <group ref={root} position={[x, 0, 0]}>
      <group ref={body}>
        <mesh onClick={(e) => { e.stopPropagation(); st.current.hop = true }}>
          <capsuleGeometry args={[radius, length, 16, 48]} />
          <meshPhysicalMaterial color={color} roughness={0.18} metalness={0.1} clearcoat={1} clearcoatRoughness={0.08} />
        </mesh>
        <group ref={eyes} position={[0, length * 0.32, 0]}>
          {[-1, 1].map((d) => (
            <mesh key={d} position={[d * radius * 0.34, 0, radius * 0.94]} scale={[radius * 0.13, radius * 0.24, radius * 0.08]}>
              <sphereGeometry args={[1, 24, 24]} />
              <meshBasicMaterial color="#ffffff" toneMapped={false} />
            </mesh>
          ))}
        </group>
      </group>
    </group>
  )
}

function Pair({ peek }: { peek?: boolean }) {
  const { width } = useThree((s) => s.viewport)
  const g = useRef<THREE.Group>(null!)
  const wide = width > 6
  useFrame((_, dt) => {
    if (!peek) return
    // peek up from the bottom edge as the section scrolls in
    g.current.position.y = damp(g.current.position.y, -3.6 + peekScroll.p * 1.9, 5, dt)
  })
  const pos: [number, number, number] = peek ? [wide ? width * 0.36 : 0, -3.6, 0] : wide ? [width * 0.2, 0, 0] : [0, 1.05, 0]
  return (
    <group ref={g} position={pos} scale={wide ? 1 : 0.5}>
      <Demon color={peek ? "#f2f1ed" : "#0d0d12"} radius={0.78} length={1.5} x={-0.85} lag={2.6} seed={0.2} peek={peek} />
      <Demon color="#2b3bff" radius={0.68} length={0.55} x={0.9} lag={1.2} seed={0.7} peek={peek} />
      {!peek && <ContactShadows position={[0, -1.62, 0]} opacity={0.35} blur={2.4} scale={7} far={2} />}
    </group>
  )
}

export default function Scene({ peek }: { peek?: boolean }) {
  return (
    <Canvas camera={{ position: [0, 0, 8], fov: 30 }} dpr={[1, 1.75]} gl={{ antialias: true, alpha: true }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[3, 5, 6]} intensity={1.4} />
      <Pair peek={peek} />
      <Environment resolution={256}>
        <color attach="background" args={[peek ? '#15151c' : '#e8e7e2']} />
        <Lightformer form="rect" intensity={5} position={[0, 5, 3]} scale={[10, 2, 1]} />
        <Lightformer form="rect" intensity={2.5} position={[-5, 1, 2]} scale={[2, 7, 1]} />
        <Lightformer form="rect" intensity={2.5} position={[5, 1, 2]} scale={[2, 7, 1]} />
        <Lightformer form="circle" color="#2b3bff" intensity={5} position={[0, -3, -4]} scale={4} />
      </Environment>
    </Canvas>
  )
}
