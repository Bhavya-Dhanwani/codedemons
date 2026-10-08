import { Reveal } from '../../../shared/components/motion/Reveal'
import { SectionLabel } from '../../../shared/components/SectionLabel'
import { PROCESS } from '../constants'
import { useProcessSteps } from '../hooks/useSectionMotion'

export function Process() {
  const ref = useProcessSteps()
  return (
    <section className="process" ref={ref}>
      <div className="section-head">
        <SectionLabel n="07" t="How we work" />
        <Reveal text="Four D's. Zero drama." className="h2" />
      </div>
      <div className="steps-line"><i /></div>
      <div className="steps">
        {PROCESS.map((p, i) => (
          <div className="step" key={p.n}>
            <span className="mono">0{i + 1}</span>
            <h3>{p.n}</h3>
            <p>{p.d}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
