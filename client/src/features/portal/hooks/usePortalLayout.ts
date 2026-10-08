import { useQuery } from '@tanstack/react-query'
import { useOutletContext } from 'react-router'
import { useBodyClass } from '../../../shared/hooks/useBodyClass'
import { useLogout, useToken } from '../../auth/hooks/useSession'
import { portalApi } from '../api/portal.api'
import type { Me } from '../types'

export const ME_KEY = ['portal', 'me']

/** Portal shell: who's logged in, tab badges for things waiting on them. */
export function usePortalLayout() {
  useBodyClass('admin-mode')
  const signedIn = !!useToken('portal')
  const me = useQuery({ queryKey: ME_KEY, queryFn: portalApi.me, enabled: signedIn })
  const toSign = me.data?.docs.filter((d) => d.status === 'sent').length ?? 0
  const toPay = me.data?.invoices.filter((i) => i.status === 'due').length ?? 0
  return {
    signedIn,
    me: me.data,
    error: me.error?.message,
    logout: useLogout('portal'),
    tabs: [
      { to: '/portal', label: 'Project', end: true },
      { to: '/portal/documents', label: 'Documents', badge: toSign },
      { to: '/portal/payments', label: 'Payments', badge: toPay },
    ],
  }
}

/** Pages inside the portal get the loaded profile from the layout. */
export const useMe = () => useOutletContext<Me>()
