import { useEffect, type RefObject } from 'react'
import { useNavigate } from 'react-router'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type Lenis from 'lenis'

const PANELS = /^\/(admin|portal|login|signup)/

/**
 * Internal <a href> links and go() play a curtain transition, then hand the URL to the router.
 * Links into the admin / portal skip the curtain.
 */
export function usePageTransition(curtain: RefObject<HTMLDivElement | null>, lenis: RefObject<Lenis | null>) {
  const navigate = useNavigate()
  useEffect(() => {
    const transition = (to: string) => {
      const [p, hash] = to.split('#')
      const target = p || '/'
      if (target === location.pathname) { if (hash) lenis.current?.scrollTo('#' + hash, { duration: 1.4 }); return }
      gsap.timeline()
        .set(curtain.current, { yPercent: 100, display: 'grid' })
        .to(curtain.current, { yPercent: 0, duration: 0.7, ease: 'expo.inOut' })
        .add(() => {
          navigate(to)
          lenis.current?.scrollTo(0, { immediate: true })
        })
        .to(curtain.current, { yPercent: -100, duration: 0.8, ease: 'expo.inOut', delay: 0.25 })
        .add(() => {
          ScrollTrigger.refresh()
          if (hash) setTimeout(() => lenis.current?.scrollTo('#' + hash, { immediate: true }), 50)
        })
    }
    const click = (e: MouseEvent) => {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button) return
      const href = (e.target as HTMLElement).closest('a')?.getAttribute('href')
      if (!href || !(href.startsWith('/') || href.startsWith('#'))) return
      e.preventDefault()
      if (PANELS.test(href)) navigate(href)
      else transition(href.startsWith('#') ? location.pathname + href : href)
    }
    const goEv = (e: Event) => transition((e as CustomEvent<string>).detail)
    document.addEventListener('click', click)
    addEventListener('cd:go', goEv)
    return () => { document.removeEventListener('click', click); removeEventListener('cd:go', goEv) }
  }, [navigate, curtain, lenis])
}
