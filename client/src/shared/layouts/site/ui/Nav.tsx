import { Logo } from '../../../components/brand/Logo'
import { EMAIL } from '../../../constants/site'
import { useClock } from '../../../hooks/useClock'

const DOCK = [['/#services', 'Services'], ['/work', 'Work'], ['/#about', 'About'], ['/#reviews', 'Reviews'], ['/#faq', 'FAQ']]

export function Nav() {
  const time = useClock()
  return (
    <header className="nav">
      <a href="/" className="logo"><Logo /></a>
      <span className="mono nav-time">{time} IST</span>
      <div className="nav-actions">
        <a href={`mailto:${EMAIL}`} className="mono nav-cta nav-mail">Start a project</a>
        <a href="/portal/login" className="mono nav-cta nav-login">Log in</a>
      </div>
    </header>
  )
}

export function Dock() {
  return (
    <nav className="dock mono">
      {DOCK.map(([href, text]) => <a key={href} href={href}>{text}</a>)}
      <a href="/#contact" className="dock-cta">Contact</a>
    </nav>
  )
}
