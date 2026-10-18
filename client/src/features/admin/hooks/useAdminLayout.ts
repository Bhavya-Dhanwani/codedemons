import { useQuery } from '@tanstack/react-query'
import { useBodyClass } from '../../../shared/hooks/useBodyClass'
import type { NavItem } from '../../../shared/components/AppShell'
import { useLogout, useToken } from '../../auth/hooks/useSession'
import { crmApi } from '../../crm/api/crm.api'
import { crmKeys } from '../../crm/hooks/keys'

/** Admin frame: who's signed in, the sidebar, and how many clients need you right now. */
export function useAdminLayout() {
  useBodyClass('admin-mode')
  const signedIn = !!useToken('admin')
  const sum = useQuery({ queryKey: crmKeys.summary, queryFn: crmApi.summary, enabled: signedIn, refetchInterval: 60_000 })
  const attention = (sum.data?.due ?? 0) + (sum.data?.inbox ?? 0)
  const nav: NavItem[] = [
    { to: '/admin/clients', label: 'Clients', icon: 'users', badge: attention, hint: 'Leads, clients, their projects, documents and payments' },
    { to: '/admin/projects', label: 'Portfolio', icon: 'grid', hint: 'Work shown on the public site' },
    { to: '/admin/reviews', label: 'Reviews', icon: 'star', hint: 'Video reviews shown on the public site' },
  ]
  return { signedIn, logout: useLogout('admin'), nav }
}
