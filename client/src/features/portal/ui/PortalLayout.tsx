import { Navigate, Outlet } from 'react-router'
import { Button } from '../../../shared/components/Button'
import { CenterScreen, ErrorText, Loading } from '../../../shared/components/Feedback'
import { TopBar } from '../../../shared/components/TopBar'
import { usePortalLayout } from '../hooks/usePortalLayout'

export default function PortalLayout() {
  const p = usePortalLayout()
  if (!p.signedIn) return <Navigate to="/portal/login" replace />
  if (!p.me) return <CenterScreen>{p.error ? <ErrorText>{p.error}</ErrorText> : <Loading />}</CenterScreen>
  return (
    <div className="ad">
      <TopBar tabs={p.tabs} actions={<Button variant="ghost" onClick={p.logout}>Log out</Button>} />
      <section className="ad-panel pt">
        <Outlet context={p.me} />
      </section>
    </div>
  )
}
