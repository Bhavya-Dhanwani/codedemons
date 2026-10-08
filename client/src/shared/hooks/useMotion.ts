import { useRef, type MouseEvent } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

/** Words slide up out of a mask when scrolled into view. */
export function useReveal<T extends HTMLElement>(delay = 0) {
  const ref = useRef<T>(null)
  useGSAP(() => {
    gsap.from(ref.current!.querySelectorAll('.w > span'), {
      yPercent: 110, rotate: 4, duration: 1.1, ease: 'expo.out', stagger: 0.06, delay,
      scrollTrigger: { trigger: ref.current, start: 'top 88%' },
    })
  }, { scope: ref })
  return ref
}

/** Words light up as you scroll through. */
export function useScrubText<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  useGSAP(() => {
    gsap.fromTo(ref.current!.querySelectorAll('span'), { opacity: 0.12 }, {
      opacity: 1, stagger: 0.05, ease: 'none',
      scrollTrigger: { trigger: ref.current, start: 'top 80%', end: 'bottom 45%', scrub: true },
    })
  }, { scope: ref })
  return ref
}

/** Element pulled toward the cursor. */
export function useMagnetic<T extends HTMLElement>(strength = 0.35) {
  const ref = useRef<T>(null)
  const onMouseMove = (e: MouseEvent) => {
    const r = ref.current!.getBoundingClientRect()
    gsap.to(ref.current, { x: (e.clientX - r.left - r.width / 2) * strength, y: (e.clientY - r.top - r.height / 2) * strength, duration: 0.6, ease: 'power3.out' })
  }
  const onMouseLeave = () => gsap.to(ref.current, { x: 0, y: 0, duration: 0.9, ease: 'elastic.out(1, 0.35)' })
  return { ref, onMouseMove, onMouseLeave }
}

/** Counts up to `to` when visible. */
export function useCounter(to: number, suffix = '') {
  const ref = useRef<HTMLSpanElement>(null)
  useGSAP(() => {
    const o = { v: 0 }
    gsap.to(o, {
      v: to, duration: 2.2, ease: 'power3.out',
      onUpdate: () => { ref.current!.textContent = Math.round(o.v) + suffix },
      scrollTrigger: { trigger: ref.current, start: 'top 90%' },
    })
  })
  return ref
}
