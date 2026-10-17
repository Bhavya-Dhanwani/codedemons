import { Button } from '../../../../shared/components/Button'
import { Chat } from '../../../../shared/components/Chat'
import { ConfirmButton } from '../../../../shared/components/ConfirmButton'
import { Field } from '../../../../shared/components/Field'
import { Feed, RowButton, RowList, Status } from '../../../../shared/components/Lists'
import { PhaseSteps } from '../../../../shared/components/PhaseSteps'
import type { ClientActions } from '../../hooks/useClientActions'
import { useProjectDetail, useProjectsTab } from '../../hooks/useProjectsTab'
import type { Client } from '../../types'
import { NoteForm } from '../NoteForm'

function PortalCallout({ c, first, onInvite }: { c: Client; first: string; onInvite: () => void }) {
  return (
    <div className={'crm-callout' + (c.portal ? ' ok' : '')}>
      {c.portal
        ? <span><b>Client portal is on.</b> {first} logs in at /portal with {c.email}.</span>
        : <span><b>Client can't see this yet.</b> Invite them to message you, follow progress, sign and pay.</span>}
      <Button disabled={!c.email} title={c.email ? '' : 'Add an email first'} onClick={onInvite}>{c.portal ? 'Resend invite' : 'Invite to portal'}</Button>
    </div>
  )
}

function ProjectDetail({ id, onBack, first }: { id: string; onBack: () => void; first: string }) {
  const d = useProjectDetail(id, onBack)
  const { p } = d
  if (!p) return <p className="cp-err">{d.error}</p>
  return (
    <>
      <div className="cp-row spread">
        <Button variant="ghost" onClick={onBack}>All projects</Button>
        <b className="crm-pj-name">{p.name}</b>
      </div>
      {d.facts && <p className="crm-hint">{d.facts}</p>}

      <Field label="Messages" as="div">
        <Chat messages={p.messages} me="studio" seenAt={p.seenAt} onSend={d.send} them={first} empty="No messages yet. Say hello, they get an email." />
      </Field>

      <Field label="Where the project is" as="div">
        <PhaseSteps current={p.phase} onPick={d.setPhase} />
      </Field>

      <Field label="Milestones the client sees" as="div">
        <ul className="checks">
          {d.milestones.map((x, i) => (
            <li key={i}>
              <label><input type="checkbox" checked={x.done} onChange={x.toggle} /> <span>{x.title}</span></label>
              <Button variant="ghost" size="sq" aria-label={`Remove ${x.title}`} onClick={x.remove}>×</Button>
            </li>
          ))}
        </ul>
        <form className="cp-row" onSubmit={d.addMilestone}>
          <input placeholder={d.milestonePlaceholder} value={d.milestone} onChange={(e) => d.setMilestone(e.target.value)} />
          <Button type="submit" disabled={!d.milestone.trim()}>Add</Button>
        </form>
      </Field>

      <Field label="Post an update, the client gets an email" as="div">
        <NoteForm value={d.update} onChange={d.setUpdate} onSubmit={d.postUpdate} placeholder="What got done this week, what's next" cta="Post update" rows={3} primary />
        <Feed items={p.updates} time={d.updateTime} />
      </Field>

      <details className="crm-more" open={!p.messages.length && !!p.brief}>
        <summary>Brief and name</summary>
        <div className="cp-fields flat">
          <Field label="Name"><input value={d.edit.name} onChange={(e) => d.setEdit('name', e.target.value)} /></Field>
          <Field label="Brief"><textarea rows={6} value={d.edit.brief} onChange={(e) => d.setEdit('brief', e.target.value)} /></Field>
          <div className="cp-row">
            <Button variant="primary" disabled={!d.briefDirty} onClick={d.saveBrief}>Save</Button>
            <ConfirmButton onConfirm={d.remove} confirm="Delete project and its messages?">Delete project</ConfirmButton>
          </div>
        </div>
      </details>
    </>
  )
}

export function ProjectsTab({ c, a }: { c: Client; a: ClientActions }) {
  const t = useProjectsTab(c)
  if (t.open) return <ProjectDetail key={t.open} id={t.open} onBack={t.back} first={t.first} />
  return (
    <>
      <PortalCallout c={c} first={t.first} onInvite={a.invite} />
      <b>{t.heading}</b>
      {!t.rows.length && <p className="crm-hint">Clients start projects from their portal, or open one for them here. Each project has its own messages, milestones and updates.</p>}
      <RowList>
        {t.rows.map((p) => (
          <RowButton key={p._id} onClick={() => t.setOpen(p._id)}>
            <span className="crm-who"><b>{p.name}{p.unread && <i className="crm-unread" title="Unread message" />}</b><small>{p.sub}</small></span>
            <Status kind="p" status={p.phase}>{p.phaseText}</Status>
            <small>{p.unread ? 'New message' : ''}</small>
          </RowButton>
        ))}
      </RowList>
      <form className="cp-row" onSubmit={t.create}>
        <input placeholder="New project name, e.g. Website redesign" value={t.name} onChange={(e) => t.setName(e.target.value)} maxLength={120} />
        <Button type="submit" disabled={t.name.trim().length < 2}>New project</Button>
      </form>
    </>
  )
}
