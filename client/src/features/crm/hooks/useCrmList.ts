import { useNavigate } from 'react-router'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useAppDispatch, useAppSelector } from '../../../shared/hooks/store'
import { useDebounced } from '../../../shared/hooks/useDebounced'
import { useToast } from '../../../shared/hooks/useToast'
import { count, day, endOfToday, inr, label } from '../../../shared/lib/format'
import { crmApi } from '../api/crm.api'
import { STAGE_VIEWS, VIEWS } from '../constants'
import { setAdding, setQuery, setView } from '../state/crmSlice'
import type { Row, Summary } from '../types'
import { crmKeys } from './keys'

/** What needs you today: each one opens the matching list. */
const attentionOf = (s: Summary) => [
  { key: 'due', n: s.due, text: s.due ? `${s.due === 1 ? '1 person' : `${s.due} people`} to follow up today` : 'Nobody to follow up today', view: 'due' },
  { key: 'inbox', n: s.inbox, text: s.inbox ? `${count(s.inbox, 'unread conversation')}` : 'No unread messages', view: 'inbox' },
  { key: 'unpaid', n: s.unpaidCount, text: s.unpaidCount ? `${inr(s.unpaidValue)} waiting to be paid` : 'Nothing unpaid', view: 'won' },
]

/** One list row, ready to render: who, where they are, what's next. */
const rowOf = (r: Row) => {
  const late = !!r.followUpAt && new Date(r.followUpAt).getTime() < endOfToday() && r.stage !== 'lost'
  return {
    ...r, late,
    stageLabel: r.stage === 'won' ? 'Client' : label(r.stage),
    valueText: r.value ? inr(r.value) : '',
    nextText: r.unread ? 'New message' : r.followUpAt ? (late ? 'Follow up today' : `Follow up ${day(r.followUpAt)}`) : r.source === 'signup' ? 'Signed up' : r.source === 'form' ? 'From website' : '',
  }
}
export type ListRow = ReturnType<typeof rowOf>

const EMPTY: Record<string, string> = {
  due: 'Nobody to follow up with today. Nice.',
  inbox: 'No unread messages.',
}

/** /admin/clients: what needs you, the view, search, the list. A client opens on its own page. */
export function useCrmList() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const toast = useToast()
  const { view, q, adding } = useAppSelector((s) => s.crm)
  const query = useDebounced(q, 250)

  const rows = useQuery({ queryKey: crmKeys.list(view, query), queryFn: () => crmApi.clients(view, query) })
  const sum = useQuery({ queryKey: crmKeys.summary, queryFn: crmApi.summary })
  const s = sum.data
  const refresh = () => {
    qc.invalidateQueries({ queryKey: crmKeys.lists })
    qc.invalidateQueries({ queryKey: crmKeys.summary })
  }
  const stage = STAGE_VIEWS.find(([v]) => v === view)

  return {
    view, q, adding,
    attention: s ? attentionOf(s) : [],
    pipeline: s ? `${inr(s.openValue)} in open deals · ${inr(s.receivedThisMonth)} received in ${new Date().toLocaleDateString('en-IN', { month: 'long' })}` : '',
    views: VIEWS,
    stages: STAGE_VIEWS,
    stage: stage?.[0] ?? '',
    rows: rows.data?.map(rowOf),
    loading: rows.isPending,
    error: rows.error?.message,
    emptyText: q ? 'No one matches that search.' : EMPTY[view] ?? 'Nobody here yet.',
    showSeeAll: view !== 'all' || !!q,
    seeAll: () => { dispatch(setView('all')); dispatch(setQuery('')) },
    setView: (v: string) => dispatch(setView(v || 'all')),
    setQuery: (v: string) => dispatch(setQuery(v)),
    open: (id: string) => navigate(`/admin/clients/${id}`),
    startAdding: () => dispatch(setAdding(true)),
    stopAdding: () => dispatch(setAdding(false)),
    leadAdded: (id: string) => { toast('Lead added'); refresh(); dispatch(setAdding(false)); navigate(`/admin/clients/${id}`) },
  }
}
