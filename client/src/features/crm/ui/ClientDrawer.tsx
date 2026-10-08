import { Drawer } from '../../../shared/components/Drawer'
import { ErrorText } from '../../../shared/components/Feedback'
import { CLIENT_TABS } from '../constants'
import { useClientDrawer } from '../hooks/useClientDrawer'
import { OverviewTab } from './tabs/OverviewTab'
import { ProjectTab } from './tabs/ProjectTab'
import { DocsTab } from './tabs/DocsTab'
import { PaymentsTab } from './tabs/PaymentsTab'
import { LicenseTab } from './tabs/LicenseTab'

export function ClientDrawer({ id, onClose }: { id: string; onClose: () => void }) {
  const cd = useClientDrawer(id)
  const { c, actions: a } = cd
  if (!c) return <Drawer title="Loading" onClose={onClose} wide><div className="ad-fields"><ErrorText>{cd.error}</ErrorText></div></Drawer>

  return (
    <Drawer title={c.name} sub={<p className="mono crm-sub">{cd.sub}</p>} onClose={onClose} wide>
      <div className="crm-body">
        <nav className="crm-tabs">
          {CLIENT_TABS.map((t) => <button key={t} className={cd.tab === t ? 'on' : ''} onClick={() => cd.setTab(t)}>{t}{cd.counts[t] ? <em>{cd.counts[t]}</em> : null}</button>)}
        </nav>
        <ErrorText className="crm-err" onDismiss={a.clearError}>{cd.error}</ErrorText>
        <div className="ad-fields">
          {cd.tab === 'Overview' && <OverviewTab c={c} a={a} onDeleted={onClose} />}
          {cd.tab === 'Project' && <ProjectTab c={c} a={a} />}
          {cd.tab === 'Documents' && <DocsTab c={c} a={a} />}
          {cd.tab === 'Payments' && <PaymentsTab c={c} a={a} />}
          {cd.tab === 'License' && <LicenseTab c={c} a={a} />}
        </div>
      </div>
    </Drawer>
  )
}
