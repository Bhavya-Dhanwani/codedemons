import { useRef } from 'react'
import { useParams } from 'react-router'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { isDark, joinParts, pad } from '../../../shared/lib/format'
import { useProjects } from './useProjects'

/** /work/:slug, one case study. */
export function useProjectPage() {
  const { slug = '' } = useParams()
  const all = useProjects()
  const ref = useRef<HTMLElement>(null)
  const i = all ? all.findIndex((p) => p.slug === slug) : -1
  const p = all?.[i]
  const next = all && p ? all[(i + 1) % all.length] : null

  useGSAP(() => {
    if (!p) return
    // cover opens from a framed card to full bleed while the image drifts
    gsap.fromTo('.pj-cover', { clipPath: 'inset(8% 10% 8% 10% round 28px)' }, {
      clipPath: 'inset(0% 0% 0% 0% round 0px)', ease: 'none',
      scrollTrigger: { trigger: '.pj-cover', start: 'top 85%', end: 'top top', scrub: true },
    })
    gsap.utils.toArray<HTMLElement>('.parallax > img, .parallax > video').forEach((im) => {
      gsap.fromTo(im, { yPercent: -8 }, { yPercent: 8, ease: 'none', scrollTrigger: { trigger: im.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } })
    })
    gsap.from('.pj-meta > div', { y: 30, opacity: 0, stagger: 0.08, duration: 1, ease: 'expo.out', delay: 0.4 })
    gsap.from('.pj-result', { y: 60, opacity: 0, stagger: 0.1, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: '.pj-results', start: 'top 80%' } })
    gsap.from('.pj-gallery > *', { y: 80, opacity: 0, stagger: 0.1, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: '.pj-gallery', start: 'top 80%' } })
    ScrollTrigger.refresh()
  }, { scope: ref, dependencies: [slug, !!p] })

  if (!all) return { state: 'loading' as const }
  if (!p) return { state: 'missing' as const }
  return {
    state: 'ready' as const, ref, slug, p,
    next: next && next !== p ? next : null,
    position: `Project ${pad(i + 1)} / ${pad(all.length)}`,
    meta: [['Client', p.client], ['Year', p.year], ['Type', p.kind], ['Services', p.services.join(', ')]].filter(([, v]) => v),
    tagline: joinParts([p.kind, p.year]),
    tintText: isDark(p.tint) ? '#fff' : 'var(--ink)',
    quote: `"${p.intro}" That was the brief. Everything you see here exists to serve that one sentence.`,
  }
}
