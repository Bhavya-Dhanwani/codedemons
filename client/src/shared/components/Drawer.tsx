import type { ReactNode } from 'react'
import { useEscape } from '../hooks/useEscape'
import { Button } from './Button'

type Props = { title: string; sub?: ReactNode; onClose: () => void; children: ReactNode; foot?: ReactNode; wide?: boolean }

/** Side panel over the page; closes on Escape or a click outside. */
export function Drawer({ title, sub, onClose, children, foot, wide }: Props) {
  useEscape(onClose)
  return (
    <div className="ad-drawer-wrap" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={'ad-drawer' + (wide ? ' wide' : '')} role="dialog" aria-label={title}>
        <header className="ad-drawer-head">
          <div><h2>{title}</h2>{sub}</div>
          <Button variant="ghost" onClick={onClose}>Close</Button>
        </header>
        {children}
        {foot && <footer className="ad-drawer-foot">{foot}</footer>}
      </div>
    </div>
  )
}
