import { Link } from 'react-router'
import { buttonClass } from '../../../../shared/components/Button'
import { Chat } from '../../../../shared/components/Chat'
import { ErrorText, Loading, Muted } from '../../../../shared/components/Feedback'
import { Feed } from '../../../../shared/components/Lists'
import { PhaseSteps } from '../../../../shared/components/PhaseSteps'
import { usePortalProject } from '../../hooks/usePortalProject'

/** /portal/projects/:id: the conversation on the left, where things stand on the right. */
export default function ProjectPage() {
  const v = usePortalProject()
  const { p } = v
  if (!p) return v.error ? <ErrorText>{v.error}</ErrorText> : <Loading />
  return (
    <div className="pj">
      <div className="pj-top">
        <Link to="/portal" className={buttonClass({ variant: 'ghost' })}>All projects</Link>
        <h1>{p.name}</h1>
        <span className="mono pt-muted">{v.started}</span>
        <PhaseSteps current={p.phase} />
      </div>

      <section className="pj-chat pt-card">
        <span className="mono">Messages</span>
        <Chat messages={p.messages} me="client" seenAt={p.seenAt} onSend={v.send} them="codedemons"
          empty="Say hi, ask anything, share links or feedback. We usually reply within a working day." />
        <ErrorText>{v.error}</ErrorText>
      </section>

      <aside className="pj-side">
        {p.milestones.length > 0 && (
          <div className="pt-card">
            <div className="ad-row spread"><span className="mono">Milestones</span><span className="mono">{v.progress.text}</span></div>
            <div className="pt-bar"><i style={{ width: `${v.progress.pct}%` }} /></div>
            <ul className="checks readonly">
              {p.milestones.map((m, i) => <li key={i} className={m.done ? 'done' : ''}><span className="tick" aria-hidden>{m.done ? '✓' : ''}</span>{m.title}</li>)}
            </ul>
          </div>
        )}
        <div className="pt-card">
          <span className="mono">Updates</span>
          {p.updates.length ? <Feed items={p.updates} time={v.updateTime} /> : <Muted>Our first update will show up here.</Muted>}
        </div>
        <details className="pt-card pj-brief">
          <summary className="mono">Your brief</summary>
          <p>{p.brief}</p>
          {v.details.map(([k, val]) => <p key={k}><b>{k}:</b> {val}</p>)}
        </details>
      </aside>
    </div>
  )
}
