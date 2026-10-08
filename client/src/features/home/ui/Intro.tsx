import { Mark } from '../../../shared/components/brand/Logo'
import { Marquee } from '../../../shared/components/motion/Marquee'
import { ScrubText } from '../../../shared/components/motion/ScrubText'
import { Counter } from '../../../shared/components/motion/Counter'
import { SectionLabel } from '../../../shared/components/SectionLabel'
import { MANIFESTO, MARQUEE_WORDS, STATS } from '../constants'

export function WordMarquee() {
  return (
    <Marquee>
      {MARQUEE_WORDS.map((t) => <span key={t} className="mq-item">{t}<Mark size={30} /></span>)}
    </Marquee>
  )
}

export function Manifesto() {
  return (
    <section className="manifesto">
      <SectionLabel n="01" t="Manifesto" />
      <ScrubText text={MANIFESTO} />
    </section>
  )
}

export function Stats() {
  return (
    <section className="stats">
      {STATS.map((s) => <div key={s.l}><b><Counter to={s.to} suffix={s.suffix} /></b><span className="mono">{s.l}</span></div>)}
    </section>
  )
}
