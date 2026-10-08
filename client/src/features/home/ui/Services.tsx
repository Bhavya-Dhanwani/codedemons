import { Reveal } from '../../../shared/components/motion/Reveal'
import { SectionLabel } from '../../../shared/components/SectionLabel'
import { SERVICES, type Service } from '../constants'
import { useServicesStack } from '../hooks/useSectionMotion'

function ServiceCard({ s, i }: { s: Service; i: number }) {
  return (
    <article className="svc" style={{ top: `calc(12vh + ${i * 28}px)` }}>
      <div className="svc-top mono"><span>{s.n}</span><span>{s.t}</span></div>
      <h3>{s.h}</h3>
      <p>{s.d}</p>
      <ul>{s.tags.map((t) => <li key={t}>{t}</li>)}</ul>
    </article>
  )
}

export function Services() {
  const ref = useServicesStack()
  return (
    <section className="services" id="services" ref={ref}>
      <div className="section-head">
        <SectionLabel n="03" t="What we do" />
        <Reveal text="Four crafts. One obsession." className="h2" />
      </div>
      <div className="stack">
        {SERVICES.map((s, i) => <ServiceCard key={s.n} s={s} i={i} />)}
      </div>
    </section>
  )
}
