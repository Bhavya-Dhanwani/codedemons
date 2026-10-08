import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { joinParts } from '../../../shared/lib/format'
import { crmApi } from '../api/crm.api'
import type { ClientTab } from '../constants'
import { useClientActions } from './useClientActions'
import { crmKeys } from './keys'

/** One client in the drawer: data, the open tab, badge counts, and the actions every tab uses. */
export function useClientDrawer(id: string) {
  const client = useQuery({ queryKey: crmKeys.client(id), queryFn: () => crmApi.client(id) })
  const actions = useClientActions(id)
  const [tab, setTab] = useState<ClientTab>('Overview')
  const c = client.data

  return {
    c, tab, setTab, actions,
    error: actions.error || client.error?.message,
    sub: c ? joinParts([c.company, c.email, c.phone], '  ·  ') : '',
    counts: {
      Documents: c?.docs.filter((d) => d.status === 'sent').length,
      Payments: c?.invoices.filter((i) => i.status !== 'paid').length,
    } as Partial<Record<ClientTab, number>>,
  }
}
