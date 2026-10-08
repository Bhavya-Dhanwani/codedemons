import { Link } from 'react-router'
import { buttonClass } from '../../../shared/components/Button'
import { Muted } from '../../../shared/components/Feedback'
import { Feed } from '../../../shared/components/Lists'
import { PanelHead } from '../../../shared/components/PanelHead'
import { PhaseSteps } from '../../../shared/components/PhaseSteps'
import { useMe } from '../hooks/usePortalLayout'
import { usePortalHome } from '../hooks/usePortalHome'

function Card({ title, aside, children }: { title: string; aside?: string; children: React.ReactNode }) {
  return (
    <div className="pt-card">
      {aside ? <div className="ad-row spread"><span className="mono">{title}</span><span className="mono">{aside}</span></div> : <span className="mono">{title}</span>}
      {children}
    </div>
  )
}

/** /portal: the project at a glance. */
export default function PortalHome() {
  const me = useMe()
  const h = usePortalHome(me)
  return (
    <>
      <PanelHead title={h.greeting} sub={h.sub} />

      {h.todo.any && (
        <div className="pt-todo">
          <b>Waiting on you</b>
          {h.todo.sign && <Link to="/portal/documents" className={buttonClass()}>{h.todo.sign}</Link>}
          {h.todo.pay && <Link to="/portal/payments" className={buttonClass({ variant: 'primary' })}>{h.todo.pay}</Link>}
        </div>
      )}

      <Card title="Stage"><PhaseSteps current={me.phase} /></Card>

      {me.milestones.length > 0 && (
        <Card title="Milestones" aside={h.progress.text}>
          <div className="pt-bar"><i style={{ width: `${h.progress.pct}%` }} /></div>
          <ul className="checks readonly">
            {me.milestones.map((m, i) => <li key={i} className={m.done ? 'done' : ''}><span className="tick" aria-hidden>{m.done ? '✓' : ''}</span>{m.title}</li>)}
          </ul>
        </Card>
      )}

      <Card title="Updates">
        {me.updates.length ? <Feed items={me.updates} time={h.updateTime} /> : <Muted>Your first update will show up here.</Muted>}
      </Card>
    </>
  )
}
