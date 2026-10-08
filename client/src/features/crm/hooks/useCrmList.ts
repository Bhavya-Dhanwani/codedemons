import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useAppDispatch, useAppSelector } from '../../../shared/hooks/store'
import { useDebounced } from '../../../shared/hooks/useDebounced'
import { useToast } from '../../../shared/hooks/useToast'
import { count, day, endOfToday, inr, label } from '../../../shared/lib/format'
import { crmApi } from '../api/crm.api'
import { openClient, setAdding, setQuery, setView } from '../state/crmSlice'
import type { Row, Summary } from '../types'
import { crmKeys } from './keys'

export type Tile = { k: string; v: string; s: string; to?: string }

const tilesOf = (sum: Summary): Tile[] => [
  { k: 'Follow up today', v: String(sum.due), s: sum.due ? 'Start here' : 'All caught up', to: 'due' },
  { k: 'Open pipeline', v: inr(sum.openValue), s: `${count(sum.openCount, 'deal')} in progress`, to: 'proposal' },
  { k: 'Unpaid', v: inr(sum.unpaidValue), s: count(sum.unpaidCount, 'invoice') },
  { k: 'Received this month', v: inr(sum.receivedThisMonth), s: new Date().toLocaleDateString('en-IN', { month: 'long' }) },
]

/** One list row, ready to render. */
const rowOf = (r: Row) => {
  const late = !!r.followUpAt && new Date(r.followUpAt).getTime() < endOfToday() && r.stage !== 'lost'
  return {
    ...r, late,
    stageLabel: r.stage === 'won' ? 'Client' : label(r.stage),
    valueText: r.value ? inr(r.value) : '',
    dueText: r.followUpAt ? (late ? 'Follow up ' : '') + day(r.followUpAt) : r.source === 'form' ? 'From website' : r.source === 'signup' ? 'Signed up' : '',
  }
}
export type ListRow = ReturnType<typeof rowOf>

/** /admin/clients: summary tiles, filter chips, search, the list, and which drawer is open. */
export function useCrmList() {
  const dispatch = useAppDispatch()
  const qc = useQueryClient()
  const toast = useToast()
  const { view, q, openId, adding } = useAppSelector((s) => s.crm)
  const query = useDebounced(q, 250)

  const rows = useQuery({ queryKey: crmKeys.list(view, query), queryFn: () => crmApi.clients(view, query) })
  const sum = useQuery({ queryKey: crmKeys.summary, queryFn: crmApi.summary })
  const refresh = () => {
    qc.invalidateQueries({ queryKey: crmKeys.lists })
    qc.invalidateQueries({ queryKey: crmKeys.summary })
  }

  return {
    view, q, openId, adding,
    tiles: sum.data ? tilesOf(sum.data) : [],
    rows: rows.data?.map(rowOf),
    error: rows.error?.message,
    emptyText: view === 'due' ? 'Nobody to follow up with today.' : q ? 'No matches.' : 'Nobody here yet.',
    showSeeAll: view === 'due',
    setView: (v: string) => dispatch(setView(v)),
    setQuery: (v: string) => dispatch(setQuery(v)),
    open: (id: string) => dispatch(openClient(id)),
    close: () => { dispatch(openClient(null)); refresh() },
    startAdding: () => dispatch(setAdding(true)),
    stopAdding: () => dispatch(setAdding(false)),
    leadAdded: (id: string) => { toast('Lead added'); refresh(); dispatch(openClient(id)) },
  }
}
