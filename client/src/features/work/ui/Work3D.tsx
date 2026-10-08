import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Billboard, Image } from '@react-three/drei'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { ik, ikPoster } from '../../../shared/lib/media'
import type { Project } from '../../../shared/types/content'
import { workIntro, go, inSpinZone, scrollByPx } from '../../../shared/lib/motion'

const { damp, clamp, lerp } = THREE.MathUtils // damp: frame-rate independent easing

// ---------- spin physics ----------
// rot/tilt in radians, vel/tiltVel in rad/s. Velocity decays exponentially (v *= e^(-k*dt)),
// so a fast flick coasts longer than a slow one and every spin settles smoothly.
const IDLE = 0.22        // rad/s drift when nobody is touching it
const DAMPING = 1.1      // per second; higher stops sooner (1.1 = speed halves every ~0.6s)
const MAX_VEL = 6        // rad/s cap so a hard flick can't blur the cards
const REST_TILT = 0.15
const ACCEL = 6          // per second; how quickly the speed eases toward its target (flywheel feel)
const spin = { rot: 0, vel: 0, target: 0, tilt: 0, tiltVel: 0, dragging: false, x: 0, y: 0, t: 0, moved: 0, hovering: false }

/**
 * Wheel over the sphere: scroll down spins it right, scroll up spins it left (front cards move that way).
 * Ticks feed a target speed rather than the speed itself, so the sphere eases up to it like a flywheel.
 * Positive rotation about Y carries the front (+z, nearest the camera) toward +x, i.e. screen right.
 */
function wheelSpin(e: WheelEvent) {
  const px = (e.deltaMode === 1 ? 16 : 1) * (e.deltaY + e.deltaX) // lines to pixels; trackpad sideways counts too
  spin.target = clamp(spin.target + px * 0.005, -MAX_VEL, MAX_VEL)
}

// ---------- intro choreography, after the reference video, scrubbed by scroll ----------
// The section's scroll progress (workIntro.p, 0..1) maps onto a timeline of T.burst "beats":
// enter: cards slide in from the right into a flat ring
// ring:  the ring turns like a carousel around the title
// stack: the ring collapses into a pile in the middle, holds for a beat
// burst: the pile explodes outward into the 3D sphere with a whirl
const T = { enter: 0.9, ring: 2.1, stack: 2.9, hold: 3.25, burst: 4.5 }
const BURST_ANGLE = 2.6  // radians the sphere whirls through as it forms
const RING_SPEED = 0.9   // carousel radians per beat
const intro = { t: 0 } // smoothed timeline position, eased toward the scroll target

const easeOut = (k: number) => 1 - Math.pow(1 - clamp(k, 0, 1), 4)
const easeInOut = (k: number) => { k = clamp(k, 0, 1); return k < 0.5 ? 8 * k ** 4 : 1 - (-2 * k + 2) ** 4 / 2 }

type Card = { p: Project; url: string; size: number; home: THREE.Vector3; i: number; n: number }

/** Every image of the given projects, repeated until the sphere reads as a cloud, spread evenly. */
function layout(projects: Project[], r: number): Card[] {
  const pool = projects.flatMap((p) =>
    [p.cover, p.detail, ...p.gallery, p.video && ikPoster(p.video, 600)].filter(Boolean).map((u) => ({ p, url: ik(u as string, 'w-600') })),
  )
  if (!pool.length) return []
  const n = Math.max(14, Math.min(pool.length, 28))
  return Array.from({ length: n }, (_, i) => {
    const { p, url } = pool[i % pool.length]
    // fibonacci sphere: even spacing, no clumps. Kept to a band (|y| <= 0.72) so no card sits
    // at a pole, where spinning around the vertical axis would only turn it on the spot.
    const y = (1 - (i / (n - 1)) * 2) * 0.72
    const rad = Math.sqrt(1 - y * y)
    const th = i * Math.PI * (3 - Math.sqrt(5))
    const home = new THREE.Vector3(Math.cos(th) * rad * r, y * r * 1.1, Math.sin(th) * rad * r)
    // varied card sizes like a moodboard
    const size = 0.55 + ((i * 37) % 10) / 22
    return { p, url, size, home, i, n }
  })
}

type ImgMesh = THREE.Mesh<THREE.BufferGeometry, THREE.ShaderMaterial & { grayscale: number; zoom: number; opacity: number }>

function CardMesh({ c, hovered, onHover }: { c: Card; hovered: React.RefObject<string | null>; onHover: (slug: string | null) => void }) {
  const g = useRef<THREE.Group>(null!)
  const m = useRef<ImgMesh>(null!)
  // scratch vectors reused every frame
  const v = useRef({ w: new THREE.Vector3(), ring: new THREE.Vector3(), off: new THREE.Vector3(14, 0, 0) })
  const stack = useMemo(() => new THREE.Vector3((c.i % 3 - 1) * 0.12, (c.i % 2 - 0.5) * 0.15, c.i * 0.015), [c.i])

  useFrame((_, dt) => {
    const { w, ring, off } = v.current
    const t = intro.t
    const lag = (c.i / c.n) * 0.35 // stagger each card a little
    const pos = g.current.position
    let introScale = 1

    if (t < T.burst) {
      // ring position turns with the timeline; ring is flat in the screen plane
      const a = (c.i / c.n) * Math.PI * 2 + t * RING_SPEED
      ring.set(Math.cos(a) * 3.1, Math.sin(a) * 2.6, 0)
      off.y = ring.y
      if (t < T.enter + lag) pos.lerpVectors(off, ring, easeOut((t - lag * 0.5) / T.enter))
      else if (t < T.ring) pos.copy(ring)
      else if (t < T.stack) pos.lerpVectors(ring, stack, easeInOut((t - T.ring) / (T.stack - T.ring)))
      else if (t < T.hold) { pos.copy(stack); introScale = 1 + Math.sin(((t - T.stack) / (T.hold - T.stack)) * Math.PI) * 0.08 }
      else pos.lerpVectors(stack, c.home, easeOut((t - T.hold - lag * 0.4) / (T.burst - T.hold)))
    } else pos.copy(c.home)

    const on = hovered.current === c.p.slug
    const any = hovered.current !== null
    g.current.scale.setScalar(damp(g.current.scale.x, c.size * introScale * (on ? 1.3 : 1), 8, dt))
    const mat = m.current.material
    mat.grayscale = damp(mat.grayscale, on ? 0 : 1, 6, dt)
    mat.zoom = damp(mat.zoom, on ? 1.12 : 1, 6, dt)
    // cards on the far side recede like depth of field (flat ring and stack stay fully visible)
    const depth = clamp((g.current.getWorldPosition(w).z + 3) / 6, 0, 1)
    const fade = t < T.hold ? 1 : 0.2 + depth * 0.8
    mat.opacity = damp(mat.opacity, (any && !on ? 0.18 : 1) * fade, 6, dt)
  })

  return (
    <group ref={g}>
      <Billboard>
        <Image
          ref={m as never}
          url={c.url}
          scale={[1, 0.66]}
          radius={0.04}
          transparent
          onPointerOver={(e) => { e.stopPropagation(); if (workIntro.done) onHover(c.p.slug) }}
          onPointerOut={() => onHover(null)}
          onClick={(e) => { e.stopPropagation(); if (workIntro.done && spin.moved < 6) go(`/work/${c.p.slug}`) }}
        />
      </Billboard>
    </group>
  )
}

function Cloud({ projects, onHover }: { projects: Project[]; onHover: (slug: string | null) => void }) {
  const group = useRef<THREE.Group>(null!)
  const hovered = useRef<string | null>(null)
  const { width } = useThree((s) => s.viewport)
  const cards = useMemo(() => layout(projects, 3.4), [projects])

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.05) // a backgrounded tab must not fling the sphere
    // ease the timeline toward the scroll position, so wheel steps glide instead of jumping
    intro.t = damp(intro.t, workIntro.p * T.burst, 7, dt)
    if (Math.abs(intro.t - workIntro.p * T.burst) < 0.002) intro.t = workIntro.p * T.burst
    const t = intro.t
    workIntro.done = t >= T.burst

    // the burst whirl and tilt are pure functions of the timeline, so scrolling back reverses them exactly
    const k = t < T.hold ? 0 : easeOut((t - T.hold) / (T.burst - T.hold))
    const introRot = k * BURST_ANGLE

    if (!workIntro.done) {
      // ring, stack and burst are choreographed: physics waits until the sphere has formed
      spin.vel = 0; spin.target = 0; spin.tiltVel = 0
      group.current.rotation.x = k * REST_TILT
    } else {
      if (!spin.dragging) {
        // the target decays exponentially back to the idle drift (none while a project is hovered),
        // and the actual speed eases toward the target: smooth spin-up, smooth glide down
        const rest = spin.hovering ? 0 : IDLE
        spin.target = rest + (spin.target - rest) * Math.exp(-DAMPING * dt)
        spin.vel = damp(spin.vel, spin.target, ACCEL, dt)
        spin.rot += spin.vel * dt
        // roll coasts on its own velocity and decays the same way (no spring: it stays where you leave it)
        spin.tilt += spin.tiltVel * dt
        spin.tiltVel *= Math.exp(-DAMPING * dt)
      }
      group.current.rotation.x = spin.tilt
    }
    group.current.rotation.y = spin.rot + introRot
  })

  const hover = (slug: string | null) => { hovered.current = slug; spin.hovering = !!slug; onHover(slug) }
  // shrink on narrow screens so the cloud keeps breathing room
  return (
    <group ref={group} scale={Math.min(1, width / 6.5)}>
      {cards.map((c, i) => <CardMesh key={i} c={c} hovered={hovered} onHover={hover} />)}
    </group>
  )
}

export default function Work3D({ projects, onHover }: { projects: Project[]; onHover: (slug: string | null) => void }) {
  const ref = useRef<HTMLDivElement>(null)

  // a fresh mount (e.g. coming back to the home page) starts from a clean sphere
  useEffect(() => {
    intro.t = workIntro.p * T.burst
    Object.assign(spin, { rot: 0, vel: 0, tilt: REST_TILT, tiltVel: 0 })
  }, [])

  // drag: direct manipulation while held, release velocity carries on as inertia
  useEffect(() => {
    // touch screens: leave every gesture to normal page scrolling (taps on cards still open them)
    if (matchMedia('(pointer: coarse)').matches) return
    const el = ref.current!
    const down = (e: PointerEvent) => {
      if (!workIntro.done) return
      // no pointer capture: capturing steals the release from the 3D scene, so card clicks would never fire
      Object.assign(spin, { dragging: true, x: e.clientX, y: e.clientY, t: performance.now(), moved: 0 })
    }
    const move = (e: PointerEvent) => {
      if (!spin.dragging) return
      const now = performance.now()
      const dt = Math.max((now - spin.t) / 1000, 1 / 240)
      const dRot = ((e.clientX - spin.x) / innerWidth) * Math.PI * 2.2
      const dTilt = ((e.clientY - spin.y) / innerHeight) * 1.4
      spin.rot += dRot
      spin.tilt += dTilt
      // smoothed instantaneous velocity, so the release speed matches the gesture
      spin.vel = spin.target = clamp(lerp(spin.vel, dRot / dt, 0.6), -MAX_VEL, MAX_VEL)
      spin.tiltVel = lerp(spin.tiltVel, dTilt / dt, 0.6)
      spin.moved += Math.abs(e.clientX - spin.x) + Math.abs(e.clientY - spin.y)
      Object.assign(spin, { x: e.clientX, y: e.clientY, t: now })
    }
    const up = () => {
      // a pause before letting go means no fling
      if (performance.now() - spin.t > 80) spin.vel = spin.target = spin.tiltVel = 0
      spin.dragging = false
    }
    // wheel inside the sphere's circle spins it (once formed); anywhere else scrolls the page.
    // stopping it here keeps it from the page's smooth scroll (which listens on window)
    let locked = false
    const wheel = (e: WheelEvent) => {
      if (!inSpinZone(el, e.clientX, e.clientY)) { locked = false; return }
      e.preventDefault()
      e.stopPropagation()
      // first captured tick glides the globe to the exact centre of the screen, once; later ticks only spin
      if (!locked) {
        locked = true
        const r = el.getBoundingClientRect()
        scrollByPx(r.top + r.height / 2 - innerHeight / 2)
      }
      wheelSpin(e)
    }
    // a drag can leave the section and release anywhere, so follow it on the window
    const release = () => { if (spin.dragging) up() }
    el.addEventListener('pointerdown', down)
    addEventListener('pointermove', move)
    addEventListener('pointerup', release)
    addEventListener('pointercancel', release)
    addEventListener('blur', release)
    el.addEventListener('wheel', wheel, { passive: false })
    return () => {
      el.removeEventListener('wheel', wheel)
      el.removeEventListener('pointerdown', down)
      removeEventListener('pointermove', move)
      removeEventListener('pointerup', release)
      removeEventListener('pointercancel', release)
      removeEventListener('blur', release)
    }
  }, [])

  return (
    <div className="work-canvas" ref={ref}>
      <Canvas camera={{ position: [0, 0, 11], fov: 40 }} dpr={[1, 1.75]} gl={{ alpha: true }}>
        <Cloud projects={projects} onHover={onHover} />
      </Canvas>
    </div>
  )
}
