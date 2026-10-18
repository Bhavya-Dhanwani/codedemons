import { useState } from 'react'
import { useParams } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import { day, endOfToday, firstName, label } from '../../../shared/lib/format'
import { crmApi } from '../api/crm.api'
import type { ClientTab } from '../constants'
import { useClientActions } from './useClientActions'
import { crmKeys } from './keys'

/** /admin/clients/:id: the client, the open tab, what each tab needs from you, and the actions every tab uses. */
export function useClientPage() {
  const { id = '' } = useParams()
  const client = useQuery({ queryKey: crmKeys.client(id), queryFn: () => crmApi.client(id) })
  const actions = useClientActions(id)
  const [tab, setTab] = useState<ClientTab>('Overview')
  const c = client.data
  const late = !!c?.followUpAt && new Date(c.followUpAt).getTime() < endOfToday()

  return {
    id, c, tab, setTab, actions,
    error: actions.error || client.error?.message,
    loading: client.isPending,
    initial: c?.name.trim()[0]?.toUpperCase() ?? '',
    stageLabel: c ? (c.stage === 'won' ? 'Client' : label(c.stage)) : '',
    contact: c ? [c.company, c.email, c.phone].filter(Boolean) : [],
    followUp: c?.followUpAt ? { text: late ? 'Follow up today' : `Follow up ${day(c.followUpAt, 'long')}`, late } : null,
    portal: c ? (c.portal ? { on: true, text: `Portal on · ${firstName(c.name)} can log in` } : { on: false, text: 'No portal access yet' }) : null,
    counts: {
      Projects: c?.projects.filter((p) => p.unread).length,
      Documents: c?.docs.filter((d) => d.status === 'sent').length,
      Payments: c?.invoices.filter((i) => i.status !== 'paid').length,
    } as Partial<Record<ClientTab, number>>,
  }
}
