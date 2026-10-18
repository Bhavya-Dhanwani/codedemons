import { Status } from '../../../shared/components/Lists'
import type { ListRow } from '../hooks/useCrmList'

function ClientListRow({ r, onOpen }: { r: ListRow; onOpen: () => void }) {
  return (
    <li>
      <button onClick={onOpen}>
        <span className="crm-avatar" aria-hidden>{r.name.trim()[0]?.toUpperCase()}</span>
        <span className="crm-who"><b>{r.name}</b><small>{r.company || r.email || 'No company or email yet'}</small></span>
        <Status kind="s" status={r.stage}>{r.stageLabel}</Status>
        <span className="crm-val">{r.valueText}</span>
        <span className={'crm-due' + (r.late || r.unread ? ' late' : '')}>{r.unread && <i className="crm-unread" aria-hidden />}{r.nextText}</span>
      </button>
    </li>
  )
}

export function ClientList({ rows, onOpen }: { rows?: ListRow[]; onOpen: (id: string) => void }) {
  return (
    <ol className="crm-list">
      {rows?.map((r) => <ClientListRow key={r._id} r={r} onOpen={() => onOpen(r._id)} />)}
    </ol>
  )
}
