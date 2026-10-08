import { Button } from '../../../../shared/components/Button'
import { ConfirmButton } from '../../../../shared/components/ConfirmButton'
import { Field } from '../../../../shared/components/Field'
import { Feed } from '../../../../shared/components/Lists'
import type { ClientActions } from '../../hooks/useClientActions'
import { useOverviewTab } from '../../hooks/useOverviewTab'
import type { Client } from '../../types'
import { NoteForm } from '../NoteForm'

export function OverviewTab({ c, a, onDeleted }: { c: Client; a: ClientActions; onDeleted: () => void }) {
  const o = useOverviewTab(c, a, onDeleted)
  return (
    <>
      <Field label="Stage" as="div">
        <div className="seg">
          {o.stages.map((s) => <button key={s.s} className={s.on ? 'on s-' + s.s : ''} onClick={s.pick}>{s.text}</button>)}
        </div>
      </Field>

      <Field label="Next follow up" as="div">
        <div className="ad-row">
          <input type="date" value={o.followUp.value} onChange={(e) => o.followUp.set(e.target.value)} />
          <Button variant="ghost" onClick={o.followUp.tomorrow}>Tomorrow</Button>
          <Button variant="ghost" onClick={o.followUp.nextWeek}>Next week</Button>
          {o.followUp.done && <Button variant="ghost" onClick={o.followUp.done}>Done</Button>}
        </div>
      </Field>

      <Field label="Notes" as="div">
        <NoteForm value={o.note} onChange={o.setNote} onSubmit={o.addNote} placeholder="Call summary, what they said, next step" cta="Add note" />
        <Feed items={c.notes} time={o.noteTime} />
      </Field>

      {c.message && (
        <Field label={o.theirMessageLabel} as="div">
          <blockquote className="crm-quote">{c.message}</blockquote>
        </Field>
      )}

      <details className="crm-more">
        <summary>Contact details and deal value</summary>
        <div className="ad-fields flat">
          <Field label="Name"><input {...o.field('name')} /></Field>
          <Field label="Email"><input type="email" {...o.field('email')} /></Field>
          <Field label="Phone"><input type="tel" {...o.field('phone')} /></Field>
          <Field label="Company"><input {...o.field('company')} /></Field>
          <Field label="Deal value (₹)"><input type="number" min={0} {...o.field('value')} /></Field>
          <div className="ad-row">
            <Button variant="primary" disabled={!o.dirty} onClick={o.saveDetails}>Save details</Button>
            <ConfirmButton onConfirm={o.remove} confirm="Delete everything?">Delete client</ConfirmButton>
          </div>
        </div>
      </details>
    </>
  )
}
