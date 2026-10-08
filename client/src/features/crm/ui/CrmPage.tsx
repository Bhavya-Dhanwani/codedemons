import { Button } from '../../../shared/components/Button'
import { EmptyState, ErrorText } from '../../../shared/components/Feedback'
import { PanelHead } from '../../../shared/components/PanelHead'
import { useCrmList } from '../hooks/useCrmList'
import { CrmTiles } from './CrmTiles'
import { CrmToolbar } from './CrmToolbar'
import { ClientList } from './ClientList'
import { NewLeadDrawer } from './NewLeadDrawer'
import { ClientDrawer } from './ClientDrawer'

/** /admin/clients: leads, deals and clients. */
export default function CrmPage() {
  const crm = useCrmList()
  return (
    <section className="ad-panel">
      <PanelHead title="Clients" sub="Leads, deals and the people you work with" action={<Button variant="primary" onClick={crm.startAdding}>New lead</Button>} />
      <CrmTiles tiles={crm.tiles} onPick={crm.setView} />
      <CrmToolbar view={crm.view} q={crm.q} onView={crm.setView} onQuery={crm.setQuery} />
      <ErrorText>{crm.error}</ErrorText>
      {crm.rows && !crm.rows.length && (
        <EmptyState>
          <p>{crm.emptyText}</p>
          {crm.showSeeAll && <Button onClick={() => crm.setView('all')}>See everyone</Button>}
        </EmptyState>
      )}
      <ClientList rows={crm.rows} onOpen={crm.open} />
      {crm.adding && <NewLeadDrawer onClose={crm.stopAdding} onSaved={crm.leadAdded} />}
      {crm.openId && <ClientDrawer key={crm.openId} id={crm.openId} onClose={crm.close} />}
    </section>
  )
}
