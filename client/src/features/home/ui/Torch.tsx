import { SectionLabel } from '../../../shared/components/SectionLabel'
import { PEEPERS } from '../constants'
import { useTorch } from '../hooks/useTorch'

function Motto() {
  return (
    <h2 className="torch-text">
      <span>From not worthy</span>
      <em>to noteworthy.</em>
    </h2>
  )
}

/** Dark room; the cursor is a torch. The motto hides in the dark, shy demons blink back. */
export function Torch() {
  const ref = useTorch()
  return (
    <section className="torch" ref={ref} data-cursor="hidden">
      <div className="torch-top">
        <SectionLabel n="02" t="In the dark" />
        <p>Somewhere out there, your brand is lost in the dark. We are the ones who find it.</p>
      </div>
      <div className="torch-dim" aria-hidden><Motto /></div>
      <div className="torch-lit"><Motto /></div>
      <div className="torch-glow" aria-hidden />
      {PEEPERS.map(([l, t], i) => (
        <div key={i} className="peeper" style={{ left: l + '%', top: t + '%', animationDelay: `${i * 0.7}s` }} aria-hidden><i /><i /></div>
      ))}
      <span className="mono torch-hint">Move your torch</span>
    </section>
  )
}
