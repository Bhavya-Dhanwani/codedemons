import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'

/** Lenis smooth scroll driving ScrollTrigger. Returns the instance for programmatic scrolls. */
export function useSmoothScroll() {
  const lenis = useRef<Lenis | null>(null)
  useEffect(() => {
    const l = new Lenis({ lerp: 0.09 })
    lenis.current = l
    l.on('scroll', ScrollTrigger.update)
    const raf = (t: number) => l.raf(t * 1000)
    gsap.ticker.add(raf)
    gsap.ticker.lagSmoothing(0)
    // one soft glide (e.g. centring the work globe); easeOutCubic so it settles instead of snapping
    const by = (e: Event) => l.scrollTo(l.scroll + (e as CustomEvent<number>).detail, { duration: 0.9, easing: (k) => 1 - (1 - k) ** 3 })
    addEventListener('cd:scrollby', by)
    return () => { gsap.ticker.remove(raf); l.destroy(); lenis.current = null; removeEventListener('cd:scrollby', by) }
  }, [])
  return lenis
}
