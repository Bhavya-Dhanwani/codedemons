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

/** Smoothly scroll the page by `dy` px (the site layout listens and drives Lenis). */
export const scrollByPx = (dy: number) => dispatchEvent(new CustomEvent('cd:scrollby', { detail: dy }))

/** Navigate with the page transition, from places that aren't links (e.g. the 3D cloud). */
export const go = (to: string) => dispatchEvent(new CustomEvent('cd:go', { detail: to }))
