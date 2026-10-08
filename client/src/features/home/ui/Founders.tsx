import { Reveal } from '../../../shared/components/motion/Reveal'
import { SectionLabel } from '../../../shared/components/SectionLabel'
import { FOUNDERS, type Founder } from '../constants'
import { useTilt } from '../hooks/useTilt'

function FounderCard({ f }: { f: Founder }) {
  const tilt = useTilt<HTMLAnchorElement>()
  return (
    <a className="founder" href={f.url} target="_blank" rel="noopener" data-cursor="Visit" {...tilt}>
      <div className="founder-art">
        <img src={f.img} alt={f.name} loading="lazy" />
      </div>
      <div className="founder-info">
        <h3>{f.name}</h3>
        <span className="mono">{f.role}</span>
        <p>{f.line}</p>
      </div>
    </a>
  )
}

export function Founders() {
  return (
    <section className="founders" id="about">
      <div className="section-head">
        <SectionLabel n="05" t="The demons" />
        <Reveal text="Two founders. Zero middlemen." className="h2" />
        <p className="lead">You talk directly to the people designing and coding your product. No account managers, no hand offs, nothing lost in translation.</p>
      </div>
      <div className="founder-grid">
        {FOUNDERS.map((f) => <FounderCard key={f.name} f={f} />)}
      </div>
    </section>
  )
}
