import { lazy } from 'react'
import { Reveal } from '../../../shared/components/motion/Reveal'
import { SafeSuspense } from '../../../shared/components/SafeSuspense'
import { useHero } from '../hooks/useSectionMotion'

const Scene = lazy(() => import('./Scene'))

export function Hero() {
  const { ref, ready } = useHero()
  return (
    <section className="hero" ref={ref}>
      <div className="hero-canvas"><SafeSuspense><Scene /></SafeSuspense></div>
      <div className="hero-meta mono">
        <span>Digital studio</span>
        <span>Design / Development / Motion</span>
        <span>Est. 2026, India</span>
      </div>
      <div className="hero-title">
        {ready && <>
          <Reveal as="h1" text="Possessed" className="display" />
          <Reveal as="h1" text="by craft." className="display accent-line" delay={0.15} />
        </>}
      </div>
      <div className="hero-foot">
        <p>We are <b>codedemons</b>, a two person studio that designs and builds websites people cannot stop scrolling.</p>
        <span className="mono hint">Psst. Click the demons.</span>
      </div>
    </section>
  )
}
