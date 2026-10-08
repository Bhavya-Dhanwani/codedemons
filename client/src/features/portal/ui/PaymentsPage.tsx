import { EmptyState } from '../../../shared/components/Feedback'
import { RowButton, RowList, Status } from '../../../shared/components/Lists'
import { PanelHead } from '../../../shared/components/PanelHead'
import { useMe } from '../hooks/usePortalLayout'
import { useInvoiceList } from '../hooks/usePortalLists'

/** /portal/payments: website status (if they have a license) and invoices. */
export default function PaymentsPage() {
  const list = useInvoiceList(useMe())
  return (
    <>
      <PanelHead title="Payments" sub="Pay by UPI in a few seconds" />
      {list.site && (
        <div className={'pt-site ' + list.site.tone}>
          <span className="mono">{list.site.label}</span>
          <b>{list.site.text}</b>
          {list.site.paid && <small>{list.site.paid}</small>}
        </div>
      )}
      {!list.invoices.length && <EmptyState><p>No invoices yet.</p></EmptyState>}
      <RowList>
        {list.invoices.map((i) => (
          <RowButton key={i._id} onClick={() => list.open(i._id)}>
            <b>{i.title}</b>
            <span className="crm-val">{i.amountText}</span>
            <Status kind="i" status={i.status}>{i.statusText}</Status>
          </RowButton>
        ))}
      </RowList>
    </>
  )
}
