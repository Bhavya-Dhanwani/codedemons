import { Fragment, useRef, type ReactNode } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger, useGSAP)

// Scroll progress (0 to 1) written by GSAP, read inside the 3D render loops.
export const heroScroll = { p: 0 }
export const peekScroll = { p: 0 }
// Work cloud intro, scrubbed by scroll: `p` 0..1 is how far through the entrance we are; `done` when it's complete.
export const workIntro = { p: 0, done: false }
// How far the sphere's middle may sit above or below the screen's middle (fraction of screen height)
// and still take the wheel. Bigger = more buffer at the top and bottom.
const SPIN_BUFFER = 0.3 // 0.34 is the half-scrolled-away position that should NOT spin

/** The wheel spins the sphere only when it's formed, near the middle of the screen, and the pointer is inside its circle. */
export function inSpinZone(el: Element, x: number, y: number) {
  if (!workIntro.done) return false
  const r = el.getBoundingClientRect()
  if (Math.abs(r.top + r.height / 2 - innerHeight / 2) > innerHeight * SPIN_BUFFER) return false // mostly off screen: just scroll
  const radius = Math.min(r.width, r.height) * 0.4
  return Math.hypot(x - (r.left + r.width / 2), y - (r.top + r.height / 2)) < radius
}

/** Smoothly scroll the page by `dy` px (App listens and drives Lenis). */
export const scrollByPx = (dy: number) => dispatchEvent(new CustomEvent('cd:scrollby', { detail: dy }))

/** Client side navigation; App listens and plays the page transition. */
export const go = (to: string) => dispatchEvent(new CustomEvent('cd:go', { detail: to }))

/** Words slide up out of a mask when scrolled into view. */
export function Reveal({ text, as: Tag = 'h2', className = '', delay = 0 }: { text: string; as?: 'h1' | 'h2' | 'h3' | 'p'; className?: string; delay?: number }) {
  const ref = useRef<HTMLHeadingElement>(null)
  useGSAP(() => {
    gsap.from(ref.current!.querySelectorAll('.w > span'), {
      yPercent: 110, rotate: 4, duration: 1.1, ease: 'expo.out', stagger: 0.06, delay,
      scrollTrigger: { trigger: ref.current, start: 'top 88%' },
    })
  }, { scope: ref })
  return (
    <Tag ref={ref} className={className} aria-label={text}>
      {text.split(' ').map((w, i) => (
        <Fragment key={i}><span className="w" aria-hidden><span>{w}</span></span>{' '}</Fragment>
      ))}
    </Tag>
  )
}

/** Paragraph whose words light up as you scroll through it. */
export function ScrubText({ text }: { text: string }) {
  const ref = useRef<HTMLParagraphElement>(null)
  useGSAP(() => {
    gsap.fromTo(ref.current!.querySelectorAll('span'), { opacity: 0.12 }, {
      opacity: 1, stagger: 0.05, ease: 'none',
      scrollTrigger: { trigger: ref.current, start: 'top 80%', end: 'bottom 45%', scrub: true },
    })
  }, { scope: ref })
  return (
    <p ref={ref} className="scrub">
      {text.split(' ').map((w, i) => <span key={i}>{w} </span>)}
    </p>
  )
}

/** Element that gets pulled toward the cursor. */
export function Magnetic({ children, strength = 0.35 }: { children: ReactNode; strength?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const move = (e: React.MouseEvent) => {
    const r = ref.current!.getBoundingClientRect()
    gsap.to(ref.current, { x: (e.clientX - r.left - r.width / 2) * strength, y: (e.clientY - r.top - r.height / 2) * strength, duration: 0.6, ease: 'power3.out' })
  }
  const leave = () => gsap.to(ref.current, { x: 0, y: 0, duration: 0.9, ease: 'elastic.out(1, 0.35)' })
  return <div ref={ref} className="magnetic" onMouseMove={move} onMouseLeave={leave}>{children}</div>
}

/** Counts up to `to` when visible. */
export function Counter({ to, suffix = '' }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  useGSAP(() => {
    const o = { v: 0 }
    gsap.to(o, {
      v: to, duration: 2.2, ease: 'power3.out',
      onUpdate: () => { ref.current!.textContent = Math.round(o.v) + suffix },
      scrollTrigger: { trigger: ref.current, start: 'top 90%' },
    })
  })
  return <span ref={ref}>0{suffix}</span>
}

/** Infinite CSS marquee; content is duplicated for a seamless loop. */
export function Marquee({ children, reverse = false }: { children: ReactNode; reverse?: boolean }) {
  return (
    <div className="marquee">
      <div className={'marquee-track' + (reverse ? ' rev' : '')}>
        <div>{children}</div>
        <div aria-hidden>{children}</div>
      </div>
    </div>
  )
}
