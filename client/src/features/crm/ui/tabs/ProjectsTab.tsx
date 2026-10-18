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
import { Card } from './OverviewTab'

function ProjectDetail({ id, onBack, first }: { id: string; onBack: () => void; first: string }) {
  const d = useProjectDetail(id, onBack)
  const { p } = d
  if (!p) return <p className="cp-err">{d.error}</p>
  return (
    <>
      <div className="cl-sub">
        <Button variant="ghost" onClick={onBack}>← All projects</Button>
        <div><h2>{p.name}</h2>{d.facts && <p className="crm-hint">{d.facts}</p>}</div>
      </div>

      <div className="cl-cols">
        <div className="cl-main">
          <Card title="Messages" aside={<small className="crm-hint">{first} gets an email for new messages</small>}>
            <Chat messages={p.messages} me="studio" seenAt={p.seenAt} onSend={d.send} them={first} empty="No messages yet. Say hello." />
          </Card>
          <Card title="Updates" aside={<small className="crm-hint">Posted to their portal, with an email</small>}>
            <NoteForm value={d.update} onChange={d.setUpdate} onSubmit={d.postUpdate} placeholder="What got done this week, what's next" cta="Post update" rows={3} primary />
            {p.updates.length > 0 && <Feed items={p.updates} time={d.updateTime} />}
          </Card>
        </div>

        <aside className="cl-aside">
          <Card title="Stage">
            <PhaseSteps current={p.phase} onPick={d.setPhase} />
          </Card>
          <Card title="Milestones" aside={<small className="crm-hint">The client sees these</small>}>
            {d.milestones.length > 0 && (
              <ul className="checks">
                {d.milestones.map((x, i) => (
                  <li key={i}>
                    <label><input type="checkbox" checked={x.done} onChange={x.toggle} /> <span>{x.title}</span></label>
                    <Button variant="ghost" size="sq" aria-label={`Remove ${x.title}`} onClick={x.remove}>×</Button>
                  </li>
                ))}
              </ul>
            )}
            <form className="cp-row" onSubmit={d.addMilestone}>
              <input placeholder={d.milestonePlaceholder} value={d.milestone} onChange={(e) => d.setMilestone(e.target.value)} />
              <Button type="submit" disabled={!d.milestone.trim()}>Add</Button>
            </form>
          </Card>
          <Card title="Brief">
            <Field label="Name"><input value={d.edit.name} onChange={(e) => d.setEdit('name', e.target.value)} /></Field>
            <Field label="What they asked for"><textarea rows={6} value={d.edit.brief} onChange={(e) => d.setEdit('brief', e.target.value)} /></Field>
            <Button variant="primary" disabled={!d.briefDirty} onClick={d.saveBrief}>Save</Button>
          </Card>
          <div className="cl-danger">
            <ConfirmButton onConfirm={d.remove} confirm="Delete project and its messages?">Delete project</ConfirmButton>
          </div>
        </aside>
      </div>
    </>
  )
}

export function ProjectsTab({ c }: { c: Client; a: ClientActions }) {
  const t = useProjectsTab(c)
  if (t.open) return <ProjectDetail key={t.open} id={t.open} onBack={t.back} first={t.first} />
  return (
    <div className="cl-narrow">
      {t.rows.length > 0
        ? (
          <RowList>
            {t.rows.map((p) => (
              <RowButton key={p._id} onClick={() => t.setOpen(p._id)}>
                <span className="crm-who"><b>{p.name}</b><small>{p.sub}</small></span>
                <Status kind="p" status={p.phase}>{p.phaseText}</Status>
                <small className={p.unread ? 'crm-new' : ''}>{p.unread ? 'New message' : 'Open'}</small>
              </RowButton>
            ))}
          </RowList>
        )
        : <p className="crm-hint">No projects yet. Clients start projects from their portal, or you can open one for them below. Each project has its own messages, milestones and updates.</p>}
      <Card title="New project">
        <form className="cp-row" onSubmit={t.create}>
          <input placeholder="e.g. Website redesign" value={t.name} onChange={(e) => t.setName(e.target.value)} maxLength={120} />
          <Button type="submit" variant="primary" disabled={t.name.trim().length < 2}>Create</Button>
        </form>
      </Card>
    </div>
  )
}
