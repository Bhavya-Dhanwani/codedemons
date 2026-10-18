import { Navigate, Outlet } from 'react-router'
import { AppShell, SideAction } from '../../../shared/components/AppShell'
import { Toast } from '../../../shared/components/Toast'
import { useAdminLayout } from '../hooks/useAdminLayout'

export default function AdminLayout() {
  const a = useAdminLayout()
  if (!a.signedIn) return <Navigate to="/admin/login" replace />
  return (
    <AppShell area="Studio admin" nav={a.nav} foot={<>
      <SideAction icon="site" href="/">View site</SideAction>
      <SideAction icon="out" onClick={a.logout}>Log out</SideAction>
    </>}>
      <Outlet />
      <Toast />
    </AppShell>
  )
}
