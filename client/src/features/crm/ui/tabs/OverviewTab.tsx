import type { ReactNode } from 'react'
import { Button } from '../../../../shared/components/Button'
import { ConfirmButton } from '../../../../shared/components/ConfirmButton'
import { Field } from '../../../../shared/components/Field'
import { Feed } from '../../../../shared/components/Lists'
import type { ClientActions } from '../../hooks/useClientActions'
import { useOverviewTab } from '../../hooks/useOverviewTab'
import type { Client } from '../../types'
import { NoteForm } from '../NoteForm'

/** A titled block on the client page. */
export function Card({ title, aside, children }: { title: string; aside?: ReactNode; children: ReactNode }) {
  return (
    <section className="cl-card">
      <div className="cl-card-head"><h3>{title}</h3>{aside}</div>
      {children}
    </section>
  )
}

export function OverviewTab({ c, a, onDeleted }: { c: Client; a: ClientActions; onDeleted: () => void }) {
  const o = useOverviewTab(c, a, onDeleted)
  return (
    <div className="cl-cols">
      <div className="cl-main">
        <Card title="Where they are">
          <div className="seg">
            {o.stages.map((s) => <button key={s.s} className={s.on ? 'on s-' + s.s : ''} onClick={s.pick}>{s.text}</button>)}
          </div>
        </Card>

        <Card title="Next follow up">
          <div className="cp-row">
            <input type="date" value={o.followUp.value} onChange={(e) => o.followUp.set(e.target.value)} aria-label="Follow up on" />
            <Button variant="ghost" onClick={o.followUp.tomorrow}>Tomorrow</Button>
            <Button variant="ghost" onClick={o.followUp.nextWeek}>Next week</Button>
            {o.followUp.done && <Button variant="ghost" onClick={o.followUp.done}>Mark done</Button>}
          </div>
        </Card>

        <Card title="Notes" aside={<small className="crm-hint">Only you see these</small>}>
          <NoteForm value={o.note} onChange={o.setNote} onSubmit={o.addNote} placeholder="Call summary, what they said, next step" cta="Add note" />
          {c.notes.length ? <Feed items={c.notes} time={o.noteTime} /> : <p className="crm-hint">No notes yet.</p>}
        </Card>
      </div>

      <aside className="cl-aside">
        {c.message && (
          <Card title={o.theirMessageLabel}>
            <blockquote className="crm-quote">{c.message}</blockquote>
          </Card>
        )}
        <Card title="Contact and deal">
          <Field label="Name"><input {...o.field('name')} /></Field>
          <Field label="Email"><input type="email" {...o.field('email')} /></Field>
          <Field label="Phone"><input type="tel" {...o.field('phone')} /></Field>
          <Field label="Company"><input {...o.field('company')} /></Field>
          <Field label="Deal value (₹)"><input type="number" min={0} {...o.field('value')} /></Field>
          <Button variant="primary" disabled={!o.dirty} onClick={o.saveDetails}>Save details</Button>
        </Card>
        <div className="cl-danger">
          <ConfirmButton onConfirm={o.remove} confirm="Delete everything for this client?">Delete client</ConfirmButton>
        </div>
      </aside>
    </div>
  )
}
