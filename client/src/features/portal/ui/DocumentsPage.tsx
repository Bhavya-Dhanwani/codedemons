import { EmptyState } from '../../../shared/components/Feedback'
import { RowButton, RowList, Status } from '../../../shared/components/Lists'
import { PanelHead } from '../../../shared/components/PanelHead'
import { useMe } from '../hooks/usePortalLayout'
import { useDocumentList } from '../hooks/usePortalLists'

/** /portal/documents */
export default function DocumentsPage() {
  const list = useDocumentList(useMe())
  return (
    <>
      <PanelHead title="Documents" sub="Read, sign and download" />
      {!list.docs.length && <EmptyState><p>Nothing to sign right now.</p></EmptyState>}
      <RowList>
        {list.docs.map((d) => (
          <RowButton key={d._id} onClick={() => list.open(d._id)}>
            <b>{d.title}</b>
            <Status kind="d" status={d.status}>{d.statusText}</Status>
            <small>{d.whenText}</small>
          </RowButton>
        ))}
      </RowList>
    </>
  )
}
