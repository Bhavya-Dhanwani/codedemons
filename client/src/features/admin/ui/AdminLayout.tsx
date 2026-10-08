import { Link, Navigate, Outlet } from 'react-router'
import { Button, buttonClass } from '../../../shared/components/Button'
import { Toast } from '../../../shared/components/Toast'
import { TopBar } from '../../../shared/components/TopBar'
import { useAdminLayout } from '../hooks/useAdminLayout'

export default function AdminLayout() {
  const a = useAdminLayout()
  if (!a.signedIn) return <Navigate to="/admin/login" replace />
  return (
    <div className="ad">
      <TopBar tabs={a.tabs} actions={<>
        <Link to="/" className={buttonClass({ variant: 'ghost' })}>View site</Link>
        <Button variant="ghost" onClick={a.logout}>Log out</Button>
      </>} />
      <Outlet />
      <Toast />
    </div>
  )
}
