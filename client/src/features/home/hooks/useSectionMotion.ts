import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { heroScroll, peekScroll } from '../../../shared/lib/motion'
import { useAppSelector } from '../../../shared/hooks/store'

/** Hero: feeds the 3D scene its scroll progress and drifts the title down. Title waits for the preloader. */
export function useHero() {
  const ref = useRef<HTMLElement>(null)
  const ready = useAppSelector((s) => s.ui.preloaded)
  useGSAP(() => {
    ScrollTrigger.create({ trigger: ref.current, start: 'top top', end: 'bottom top', onUpdate: (s) => (heroScroll.p = s.progress) })
    gsap.to('.hero-title', { yPercent: 35, ease: 'none', scrollTrigger: { trigger: ref.current, start: 'top top', end: 'bottom top', scrub: true } })
  }, { scope: ref })
  return { ref, ready }
}

/** Each service card sinks back as the next one stacks over it. */
export function useServicesStack() {
  const ref = useRef<HTMLElement>(null)
  useGSAP(() => {
    gsap.utils.toArray<HTMLElement>('.svc').slice(0, -1).forEach((card) => {
      gsap.to(card, { scale: 0.93, ease: 'none', scrollTrigger: { trigger: card, start: 'top 15%', end: 'bottom 15%', scrub: true } })
    })
  }, { scope: ref })
  return ref
}

/** Process steps rise in while a line draws across. */
export function useProcessSteps() {
  const ref = useRef<HTMLElement>(null)
  useGSAP(() => {
    gsap.from('.step', { y: 80, opacity: 0, stagger: 0.12, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: '.steps', start: 'top 80%' } })
    gsap.fromTo('.steps-line i', { scaleX: 0 }, { scaleX: 1, ease: 'none', scrollTrigger: { trigger: '.steps', start: 'top 75%', end: 'bottom 50%', scrub: true } })
  }, { scope: ref })
  return ref
}

/** The demons peek up from the bottom of the contact section. */
export function useCtaPeek() {
  const ref = useRef<HTMLElement>(null)
  useGSAP(() => {
    ScrollTrigger.create({ trigger: ref.current, start: 'top bottom', end: 'center center', onUpdate: (s) => (peekScroll.p = s.progress) })
  }, { scope: ref })
  return ref
}
