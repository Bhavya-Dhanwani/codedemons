import { Link, useNavigate } from 'react-router'
import { Button } from '../../../shared/components/Button'
import { ErrorText, Loading } from '../../../shared/components/Feedback'
import { Icon } from '../../../shared/components/Icon'
import { Status } from '../../../shared/components/Lists'
import { CLIENT_TABS } from '../constants'
import { useClientPage } from '../hooks/useClientPage'
import { OverviewTab } from './tabs/OverviewTab'
import { ProjectsTab } from './tabs/ProjectsTab'
import { DocsTab } from './tabs/DocsTab'
import { PaymentsTab } from './tabs/PaymentsTab'
import { LicenseTab } from './tabs/LicenseTab'

/** /admin/clients/:id: one client, everything about them on one page. */
export default function ClientPage() {
  const cp = useClientPage()
  const navigate = useNavigate()
  const { c, actions: a } = cp
  const back = <Link to="/admin/clients" className="cl-back"><Icon name="back" size={16} /> All clients</Link>
  if (!c) return <section className="cp-panel">{back}{cp.loading ? <Loading /> : <ErrorText>{cp.error}</ErrorText>}</section>

  return (
    <section className="cp-panel cl">
      {back}
      <header className="cl-head">
        <span className="crm-avatar big" aria-hidden>{cp.initial}</span>
        <div className="cl-id">
          <div className="cl-title"><h1>{c.name}</h1><Status kind="s" status={c.stage}>{cp.stageLabel}</Status></div>
          <p className="cl-contact">{cp.contact.length ? cp.contact.join('  ·  ') : 'No contact details yet'}</p>
          <p className="cl-meta">
            {cp.followUp && <span className={cp.followUp.late ? 'late' : ''}>{cp.followUp.text}</span>}
            {cp.portal && <span className={cp.portal.on ? 'ok' : ''}>{cp.portal.text}</span>}
          </p>
        </div>
        {c.portal
          ? <Button variant="ghost" onClick={a.invite}>Resend portal invite</Button>
          : <Button variant="primary" disabled={!c.email} title={c.email ? '' : 'Add an email first'} onClick={a.invite}>Invite to portal</Button>}
      </header>

      <nav className="crm-tabs cl-tabs">
        {CLIENT_TABS.map((t) => (
          <button key={t} className={cp.tab === t ? 'on' : ''} onClick={() => cp.setTab(t)}>
            {t}{cp.counts[t] ? <em>{cp.counts[t]}</em> : null}
          </button>
        ))}
      </nav>
      <ErrorText className="crm-err" onDismiss={a.clearError}>{cp.error}</ErrorText>

      <div className="cl-body">
        {cp.tab === 'Overview' && <OverviewTab c={c} a={a} onDeleted={() => navigate('/admin/clients')} />}
        {cp.tab === 'Projects' && <ProjectsTab c={c} a={a} />}
        {cp.tab === 'Documents' && <DocsTab c={c} a={a} />}
        {cp.tab === 'Payments' && <PaymentsTab c={c} a={a} />}
        {cp.tab === 'Website' && <LicenseTab c={c} a={a} />}
      </div>
    </section>
  )
}
