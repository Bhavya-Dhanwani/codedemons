import { Button } from '../../../../shared/components/Button'
import { Field } from '../../../../shared/components/Field'
import { Feed } from '../../../../shared/components/Lists'
import { PhaseSteps } from '../../../../shared/components/PhaseSteps'
import type { ClientActions } from '../../hooks/useClientActions'
import { useProjectTab } from '../../hooks/useProjectTab'
import type { Client } from '../../types'
import { NoteForm } from '../NoteForm'

function PortalCallout({ c, first, canInvite, onInvite }: { c: Client; first: string; canInvite: boolean; onInvite: () => void }) {
  return (
    <div className={'crm-callout' + (c.portal ? ' ok' : '')}>
      {c.portal
        ? <><b>Client portal is on.</b> {first} logs in at /portal with {c.email}.</>
        : <><b>Client can't see this yet.</b> Invite them and they'll follow progress, sign documents and pay from their portal.</>}
      <Button disabled={!canInvite} title={canInvite ? '' : 'Add an email first'} onClick={onInvite}>{c.portal ? 'Resend invite' : 'Invite to portal'}</Button>
    </div>
  )
}

export function ProjectTab({ c, a }: { c: Client; a: ClientActions }) {
  const p = useProjectTab(c, a)
  return (
    <>
      <PortalCallout c={c} first={p.first} canInvite={p.canInvite} onInvite={p.invite} />

      <Field label="Where the project is" as="div">
        <PhaseSteps current={c.phase} onPick={p.setPhase} />
      </Field>

      <Field label="Milestones the client sees" as="div">
        <ul className="checks">
          {p.milestones.map((x, i) => (
            <li key={i}>
              <label><input type="checkbox" checked={x.done} onChange={x.toggle} /> <span>{x.title}</span></label>
              <Button variant="ghost" size="sq" aria-label={`Remove ${x.title}`} onClick={x.remove}>×</Button>
            </li>
          ))}
        </ul>
        <form className="ad-row" onSubmit={p.addMilestone}>
          <input placeholder={p.milestonePlaceholder} value={p.milestone} onChange={(e) => p.setMilestone(e.target.value)} />
          <Button type="submit" disabled={!p.milestone.trim()}>Add</Button>
        </form>
      </Field>

      <Field label={`Post an update${c.portal ? ', the client gets an email' : ''}`} as="div">
        <NoteForm value={p.update} onChange={p.setUpdate} onSubmit={p.postUpdate} placeholder="What got done this week, what's next" cta="Post update" rows={3} primary />
        <Feed items={c.updates} time={p.updateTime} />
      </Field>
    </>
  )
}
