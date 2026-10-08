import type { ComponentType } from 'react'
import { createBrowserRouter, redirect, type LoaderFunctionArgs } from 'react-router'
import type { Scope } from '../shared/api/api'
import { store } from './store'
import SiteLayout from '../shared/layouts/site/ui/SiteLayout'
import HomePage from '../features/home/ui/HomePage'
import WorkPage from '../features/work/ui/WorkPage'
import ProjectPage from '../features/work/ui/project/ProjectPage'
import NotFoundPage from '../features/not-found/ui/NotFoundPage'
import RouteError from '../features/not-found/ui/RouteError'
import { PROJECTS, REVIEWS, type Resource } from '../features/admin/config/resources'

// ---- guards: run before a page loads ----
/** Logged out? Go to the login page, then come back here. */
const requireAuth = (scope: Scope) => ({ request }: LoaderFunctionArgs) => {
  if (store.getState().auth[scope]) return null
  const { pathname, search } = new URL(request.url)
  return redirect(`/${scope}/login?next=${encodeURIComponent(pathname + search)}`)
}
/** Already logged in? Skip the login page. */
const guestOnly = (scope: Scope) => () => (store.getState().auth[scope] ? redirect(`/${scope}`) : null)

/** Razorpay sends clients back to /portal?paid=<invoice id>. */
const paidReturn = ({ request }: LoaderFunctionArgs) => {
  const id = new URL(request.url).searchParams.get('paid')
  return id ? redirect(`/portal/payments/${id}?paid=1`) : null
}

// ---- code splitting: the admin and portal only load when visited ----
const page = (load: () => Promise<{ default: ComponentType }>) => async () => ({ Component: (await load()).default })
const manager = (res: Resource) => async () => {
  const { default: ContentManager } = await import('../features/admin/ui/ContentManager')
  return { element: <ContentManager key={res.path} res={res} /> }
}

export const router = createBrowserRouter([
  {
    path: '/',
    Component: SiteLayout,
    errorElement: <RouteError />,
    children: [
      { index: true, Component: HomePage },
      { path: 'work', Component: WorkPage },
      { path: 'work/:slug', Component: ProjectPage },
      { path: '*', Component: NotFoundPage },
    ],
  },

  // short links
  { path: '/login', loader: () => redirect('/portal/login') },
  { path: '/signup', loader: () => redirect('/portal/signup') },

  { path: '/admin/login', loader: guestOnly('admin'), lazy: page(() => import('../features/auth/ui/AdminLoginPage')), errorElement: <RouteError /> },
  {
    path: '/admin',
    loader: requireAuth('admin'),
    lazy: page(() => import('../features/admin/ui/AdminLayout')),
    errorElement: <RouteError />,
    children: [
      { index: true, loader: () => redirect('/admin/clients') },
      { path: 'clients', lazy: page(() => import('../features/crm/ui/CrmPage')) },
      { path: 'projects', lazy: manager(PROJECTS) },
      { path: 'reviews', lazy: manager(REVIEWS) },
    ],
  },

  { path: '/portal/login', loader: guestOnly('portal'), lazy: page(() => import('../features/auth/ui/PortalLoginPage')), errorElement: <RouteError /> },
  { path: '/portal/signup', loader: guestOnly('portal'), lazy: page(() => import('../features/auth/ui/SignupPage')), errorElement: <RouteError /> },
  {
    path: '/portal',
    loader: requireAuth('portal'),
    lazy: page(() => import('../features/portal/ui/PortalLayout')),
    errorElement: <RouteError />,
    children: [
      { index: true, loader: paidReturn, lazy: page(() => import('../features/portal/ui/PortalHome')) },
      { path: 'documents', lazy: page(() => import('../features/portal/ui/DocumentsPage')) },
      { path: 'documents/:id', lazy: page(() => import('../features/portal/ui/DocumentPage')) },
      { path: 'payments', lazy: page(() => import('../features/portal/ui/PaymentsPage')) },
      { path: 'payments/:id', lazy: page(() => import('../features/portal/ui/PaymentPage')) },
    ],
  },
])
