import { useQuery } from '@tanstack/react-query'
import { useOutletContext } from 'react-router'
import { useBodyClass } from '../../../shared/hooks/useBodyClass'
import type { NavItem } from '../../../shared/components/AppShell'
import { useLogout, useToken } from '../../auth/hooks/useSession'
import { portalApi } from '../api/portal.api'
import type { Me } from '../types'

export const ME_KEY = ['portal', 'me']

/** Portal frame: who's logged in, the sidebar with counts of what's waiting on them. */
export function usePortalLayout() {
  useBodyClass('admin-mode')
  const signedIn = !!useToken('portal')
  const me = useQuery({ queryKey: ME_KEY, queryFn: portalApi.me, enabled: signedIn, refetchInterval: 30_000 })
  const toSign = me.data?.docs.filter((d) => d.status === 'sent').length ?? 0
  const toPay = me.data?.invoices.filter((i) => i.status === 'due').length ?? 0
  const unread = me.data?.projects.filter((p) => p.unread).length ?? 0
  return {
    signedIn,
    me: me.data,
    error: me.error?.message,
    logout: useLogout('portal'),
    nav: [
      { to: '/portal', label: 'Projects', icon: 'folder', end: true, also: '/portal/projects', badge: unread, hint: 'Your projects and messages' },
      { to: '/portal/documents', label: 'Documents', icon: 'file', badge: toSign, hint: 'Read and sign' },
      { to: '/portal/payments', label: 'Payments', icon: 'card', badge: toPay, hint: 'Invoices and your website plan' },
    ] satisfies NavItem[],
  }
}

/** Pages inside the portal get the loaded profile from the layout. */
export const useMe = () => useOutletContext<Me>()
