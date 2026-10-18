import { Button } from '../../../shared/components/Button'
import { EmptyState, ErrorText, Loading } from '../../../shared/components/Feedback'
import { PanelHead } from '../../../shared/components/PanelHead'
import { useCrmList } from '../hooks/useCrmList'
import { ClientList } from './ClientList'
import { NewLeadDrawer } from './NewLeadDrawer'

/** /admin/clients: leads, deals and clients. What needs you first, then the list. */
export default function CrmPage() {
  const crm = useCrmList()
  return (
    <section className="cp-panel">
      <PanelHead title="Clients" sub={crm.pipeline} action={<Button variant="primary" onClick={crm.startAdding}>New lead</Button>} />

      <div className="crm-attn">
        {crm.attention.map((a) => (
          <button key={a.key} type="button" className={(a.n ? 'hot' : '') + (crm.view === a.view ? ' on' : '')} onClick={() => crm.setView(a.view)}>
            <b>{a.n}</b><span>{a.text}</span>
          </button>
        ))}
      </div>

      <div className="crm-bar">
        <div className="seg">
          {crm.views.map(([v, l]) => <button key={v} className={crm.view === v ? 'on' : ''} onClick={() => crm.setView(v)}>{l}</button>)}
        </div>
        <select className={'crm-stage' + (crm.stage ? ' on' : '')} value={crm.stage} onChange={(e) => crm.setView(e.target.value)} aria-label="Stage">
          <option value="">Any stage</option>
          {crm.stages.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <input className="crm-search" type="search" placeholder="Search name, email or company" value={crm.q} onChange={(e) => crm.setQuery(e.target.value)} />
      </div>

      <ErrorText>{crm.error}</ErrorText>
      {crm.loading && <Loading />}
      {crm.rows && !crm.rows.length && (
        <EmptyState>
          <p>{crm.emptyText}</p>
          {crm.showSeeAll && <Button onClick={crm.seeAll}>See everyone</Button>}
        </EmptyState>
      )}
      <ClientList rows={crm.rows} onOpen={crm.open} />
      {crm.adding && <NewLeadDrawer onClose={crm.stopAdding} onSaved={crm.leadAdded} />}
    </section>
  )
}
