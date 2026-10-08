import { Reveal } from '../../../shared/components/motion/Reveal'
import { SectionLabel } from '../../../shared/components/SectionLabel'
import { FAQ } from '../constants'
import { useFaq } from '../hooks/useFaq'

function FaqItem({ q, a, open, onToggle }: { q: string; a: string; open: boolean; onToggle: () => void }) {
  return (
    <div className={'faq-item' + (open ? ' open' : '')}>
      <button onClick={onToggle} aria-expanded={open}>
        <span>{q}</span><i className="plus" />
      </button>
      <div className="faq-a"><div><p>{a}</p></div></div>
    </div>
  )
}

export function Faq() {
  const faq = useFaq()
  return (
    <section className="faq" id="faq">
      <div className="section-head center">
        <SectionLabel n="08" t="FAQ" />
        <Reveal text="Questions, answered." className="h2" />
      </div>
      <div className="faq-list">
        {FAQ.map((f, i) => <FaqItem key={i} q={f.q} a={f.a} open={faq.isOpen(i)} onToggle={() => faq.toggle(i)} />)}
      </div>
    </section>
  )
}
