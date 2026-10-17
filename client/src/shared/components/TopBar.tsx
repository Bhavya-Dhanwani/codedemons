import type { ReactNode } from 'react'
import { NavLink } from 'react-router'
import { Logo } from './brand/Logo'

export type Tab = { to: string; label: string; badge?: number; end?: boolean }

/** Sticky header of the admin and the portal: logo, route tabs, actions. */
export function TopBar({ tabs, actions }: { tabs: Tab[]; actions: ReactNode }) {
  return (
    <header className="cp-top">
      {/* a full page load back to the site, which sets up its own scroll and 3D */}
      <a href="/" className="logo"><Logo /></a>
      <nav className="cp-tabs">
        {tabs.map((t) => (
          <NavLink key={t.to} to={t.to} end={t.end} className={({ isActive }) => (isActive ? 'on' : '')}>
            {t.label}{t.badge ? <em className="pt-dot">{t.badge}</em> : null}
          </NavLink>
        ))}
      </nav>
      <div className="cp-row">{actions}</div>
    </header>
  )
}
