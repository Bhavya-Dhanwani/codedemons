import { useBodyClass } from '../../../shared/hooks/useBodyClass'
import { useLogout, useToken } from '../../auth/hooks/useSession'

const TABS = [
  { to: '/admin/clients', label: 'Clients' },
  { to: '/admin/projects', label: 'Projects' },
  { to: '/admin/reviews', label: 'Reviews' },
]

export function useAdminLayout() {
  useBodyClass('admin-mode')
  return { signedIn: !!useToken('admin'), logout: useLogout('admin'), tabs: TABS }
}
