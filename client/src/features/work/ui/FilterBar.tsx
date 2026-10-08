import { Chip } from '../../../shared/components/Chip'
import type { WorkView } from '../state/workSlice'

type Props = { kinds: string[]; filter: string; view: WorkView; onFilter: (k: string) => void; onView: (v: WorkView) => void }

const VIEWS: WorkView[] = ['grid', 'list']

export function FilterBar({ kinds, filter, view, onFilter, onView }: Props) {
  return (
    <div className="wp-bar">
      <div className="chips" role="tablist" aria-label="Filter by type">
        {kinds.map((k) => <Chip key={k} role="tab" aria-selected={filter === k} on={filter === k} onClick={() => onFilter(k)}>{k}</Chip>)}
      </div>
      <div className="chips" aria-label="View">
        {VIEWS.map((v) => <Chip key={v} on={view === v} aria-pressed={view === v} onClick={() => onView(v)}>{v}</Chip>)}
      </div>
    </div>
  )
}
