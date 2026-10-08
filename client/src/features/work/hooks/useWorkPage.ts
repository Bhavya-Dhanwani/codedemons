import { useMemo, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { useAppDispatch, useAppSelector } from '../../../shared/hooks/store'
import { pad } from '../../../shared/lib/format'
import { setFilter, setView, type WorkView } from '../state/workSlice'
import { useProjects } from './useProjects'

/** /work: every project, filterable, as two opposing reels or a list. */
export function useWorkPage() {
  const all = useProjects()
  const ref = useRef<HTMLElement>(null)
  const dispatch = useAppDispatch()
  const { filter, view } = useAppSelector((s) => s.work)

  const kinds = useMemo(() => ['All', ...new Set((all ?? []).map((p) => p.kind).filter(Boolean))], [all])
  const list = useMemo(() => (all ?? []).filter((p) => filter === 'All' || p.kind === filter), [all, filter])

  useGSAP(() => {
    gsap.from('.wp-head > .mono, .wp-bar', { y: 30, opacity: 0, stagger: 0.08, duration: 1, ease: 'expo.out', delay: 0.3 })
  }, { scope: ref })

  useGSAP(() => {
    if (view !== 'grid' || !list.length) return
    const mm = gsap.matchMedia()

    // desktop: two reels pinned side by side, travelling in opposite directions
    mm.add('(min-width: 801px)', () => {
      const L = ref.current!.querySelector<HTMLElement>('.reel-l')!
      const R = ref.current!.querySelector<HTMLElement>('.reel-r')!
      const travel = (el: HTMLElement) => Math.max(0, el.scrollHeight - innerHeight)
      // scroll speed tilts the reels; quickTo eases toward the target, so the tilt is damped
      const skewL = gsap.quickTo(L, 'skewY', { duration: 0.6, ease: 'power3' })
      const skewR = gsap.quickTo(R, 'skewY', { duration: 0.6, ease: 'power3' })
      const rail = ref.current!.querySelector<HTMLElement>('.reel-rail i')!
      const settle = () => { skewL(0); skewR(0) }

      gsap.timeline({
        scrollTrigger: {
          trigger: '.reels', start: 'top top', end: () => '+=' + Math.max(travel(L), travel(R), innerHeight * 0.5),
          pin: true, scrub: 0.8, invalidateOnRefresh: true,
          onUpdate: (s) => {
            const tilt = gsap.utils.clamp(-5, 5, s.getVelocity() / 450)
            skewL(-tilt); skewR(tilt) // opposite reels lean opposite ways
            rail.style.transform = `scaleY(${s.progress})`
          },
        },
      })
        .fromTo(L, { y: 0 }, { y: () => -travel(L), ease: 'none' }, 0)
        .fromTo(R, { y: () => -travel(R) }, { y: 0, ease: 'none' }, 0)

      ScrollTrigger.addEventListener('scrollEnd', settle)
      gsap.from('.rcard', { opacity: 0, y: 80, stagger: 0.06, duration: 1.1, ease: 'expo.out', delay: 0.2 })
      return () => ScrollTrigger.removeEventListener('scrollEnd', settle)
    })

    // phones: one reel, cards reveal as they scroll in
    mm.add('(max-width: 800px)', () => {
      const cards = gsap.utils.toArray<HTMLElement>('.reel-l .rcard')
      const reveal = (els: Element[]) => gsap.to(els, { clipPath: 'inset(0% 0% 0% 0%)', y: 0, duration: 1.1, ease: 'expo.out', stagger: 0.1 })
      gsap.set(cards, { clipPath: 'inset(100% 0% 0% 0%)', y: 50 })
      const onScreen = cards.filter((c) => c.getBoundingClientRect().top < innerHeight * 0.92)
      reveal(onScreen)
      const later = cards.filter((c) => !onScreen.includes(c))
      if (later.length) ScrollTrigger.batch(later, { start: 'top 92%', once: true, onEnter: reveal })
    })

    ScrollTrigger.refresh()
    return () => mm.revert()
  }, { scope: ref, dependencies: [all?.length, view, filter], revertOnUpdate: true })

  return {
    ref, kinds, list, filter, view,
    total: all ? pad(all.length) : null,
    loading: !all,
    empty: !!all && !list.length,
    pickFilter: (k: string) => dispatch(setFilter(k)),
    pickView: (v: WorkView) => dispatch(setView(v)),
  }
}
