import { Navigate, Outlet } from 'react-router'
import { AppShell, SideAction } from '../../../shared/components/AppShell'
import { CenterScreen, ErrorText, Loading } from '../../../shared/components/Feedback'
import { usePortalLayout } from '../hooks/usePortalLayout'

export default function PortalLayout() {
  const p = usePortalLayout()
  if (!p.signedIn) return <Navigate to="/portal/login" replace />
  if (!p.me) return <CenterScreen>{p.error ? <ErrorText>{p.error}</ErrorText> : <Loading />}</CenterScreen>
  return (
    <AppShell area="Client portal" nav={p.nav} foot={<>
      <div className="app-who"><b>{p.me.name}</b>{p.me.company && <small>{p.me.company}</small>}</div>
      <SideAction icon="out" onClick={p.logout}>Log out</SideAction>
    </>}>
      <section className="cp-panel pt">
        <Outlet context={p.me} />
      </section>
    </AppShell>
  )
}
