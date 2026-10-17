import { Link } from 'react-router'
import { buttonClass } from '../../../shared/components/Button'
import { PanelHead } from '../../../shared/components/PanelHead'
import { useMe } from '../hooks/usePortalLayout'
import { usePortalHome } from '../hooks/usePortalHome'
import { NewProjectForm } from './project/NewProjectForm'

/** /portal: their projects. No project yet = a welcome and the form to start one. */
export default function PortalHome() {
  const h = usePortalHome(useMe())

  if (h.empty) return (
    <div className="np-welcome">
      <span className="mono">Welcome, {h.first}</span>
      <h1>Let's start your <em>first project.</em></h1>
      <p className="pt-muted">Tell us what you need. Then message us, follow progress, sign documents and pay, all from here.</p>
      <NewProjectForm />
    </div>
  )

  return (
    <>
      <PanelHead title={h.greeting} sub="Your projects with codedemons" action={<Link to="/portal/projects/new" className={buttonClass({ variant: 'primary' })}>New project</Link>} />

      {h.todo.any && (
        <div className="pt-todo">
          <b>Waiting on you</b>
          {h.todo.read && <span className="pt-pill">{h.todo.read}</span>}
          {h.todo.sign && <Link to="/portal/documents" className={buttonClass()}>{h.todo.sign}</Link>}
          {h.todo.pay && <Link to="/portal/payments" className={buttonClass({ variant: 'primary' })}>{h.todo.pay}</Link>}
        </div>
      )}

      <div className="pj-cards">
        {h.projects.map((p) => (
          <Link key={p._id} to={`/portal/projects/${p._id}`} className="pj-card">
            <div className="ad-row spread"><span className="mono">{p.phaseText}</span>{p.unread && <span className="pt-pill">New message</span>}</div>
            <b>{p.name}</b>
            <div className="pt-bar"><i style={{ width: `${p.pct}%` }} /></div>
            <small>{p.progressText}</small>
          </Link>
        ))}
      </div>
    </>
  )
}
