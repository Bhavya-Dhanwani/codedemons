import type { ReactNode } from 'react'
import { Link, useLocation } from 'react-router'
import { Logo } from './brand/Logo'
import { Icon, type IconName } from './Icon'

/** `also`: other paths that belong to this item (e.g. /portal/projects/… under Projects) */
export type NavItem = { to: string; label: string; icon: IconName; badge?: number; end?: boolean; also?: string; hint?: string }

const isOn = (n: NavItem, path: string) => (n.end ? path === n.to : path.startsWith(n.to)) || (!!n.also && path.startsWith(n.also))

type Props = {
  /** small line under the logo, e.g. "Studio admin" or "Client portal" */
  area: string
  nav: NavItem[]
  /** bottom of the sidebar: who is signed in, view site, log out */
  foot: ReactNode
  children: ReactNode
}

/**
 * The admin and portal frame: a sidebar with where you can go (and what needs you), the page beside it.
 * On narrow screens the sidebar becomes a bar across the top.
 */
export function AppShell({ area, nav, foot, children }: Props) {
  const { pathname } = useLocation()
  return (
    <div className="app">
      <aside className="app-side">
        {/* a full page load back to the site, which sets up its own scroll and 3D */}
        <a href="/" className="app-brand logo"><Logo /></a>
        <span className="mono app-area">{area}</span>
        <nav className="app-nav">
          {nav.map((n) => (
            <Link key={n.to} to={n.to} title={n.hint} className={isOn(n, pathname) ? 'on' : ''} aria-current={isOn(n, pathname) ? 'page' : undefined}>
              <Icon name={n.icon} />
              <span>{n.label}</span>
              {n.badge ? <em aria-label={`${n.badge} need attention`}>{n.badge}</em> : null}
            </Link>
          ))}
        </nav>
        <div className="app-foot">{foot}</div>
      </aside>
      <main className="app-main">{children}</main>
    </div>
  )
}

/** A quiet link or button at the bottom of the sidebar. */
export function SideAction({ icon, children, onClick, href }: { icon: IconName; children: ReactNode; onClick?: () => void; href?: string }) {
  const inner = <><Icon name={icon} /><span>{children}</span></>
  return href ? <a className="app-act" href={href}>{inner}</a> : <button type="button" className="app-act" onClick={onClick}>{inner}</button>
}
