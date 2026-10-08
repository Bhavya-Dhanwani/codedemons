import { Chip } from '../../../shared/components/Chip'
import { VIEWS } from '../constants'

type Props = { view: string; q: string; onView: (v: string) => void; onQuery: (q: string) => void }

export function CrmToolbar({ view, q, onView, onQuery }: Props) {
  return (
    <div className="crm-bar">
      <div className="crm-chips">
        {VIEWS.map(([v, l]) => <Chip key={v} on={view === v} onClick={() => onView(v)}>{l}</Chip>)}
      </div>
      <input className="crm-search" placeholder="Search name, email, company" value={q} onChange={(e) => onQuery(e.target.value)} />
    </div>
  )
}
