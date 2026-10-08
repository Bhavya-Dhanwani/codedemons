import { lazy } from 'react'
import { Reveal } from '../../../shared/components/motion/Reveal'
import { SafeSuspense } from '../../../shared/components/SafeSuspense'
import { SectionLabel } from '../../../shared/components/SectionLabel'
import { EMAIL } from '../../../shared/constants/site'
import { useCtaPeek } from '../hooks/useSectionMotion'
import { ContactForm } from './ContactForm'

const Scene = lazy(() => import('./Scene'))

export function Cta() {
  const ref = useCtaPeek()
  return (
    <section className="cta" id="contact" ref={ref}>
      <SectionLabel n="09" t="Let's talk" />
      <Reveal text="Ready when you are." className="h2 cta-small" />
      <Reveal text="Summon us." className="mega accent-line" delay={0.1} />
      <ContactForm />
      <p className="mono">or write to <a href={`mailto:${EMAIL}`}>{EMAIL}</a></p>
      <div className="cta-peek"><SafeSuspense><Scene peek /></SafeSuspense></div>
    </section>
  )
}
