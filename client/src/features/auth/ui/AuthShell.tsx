import type { FormEvent, ReactNode } from 'react'
import { Link } from 'react-router'
import { Logo } from '../../../shared/components/brand/Logo'
import { CenterScreen, ErrorText } from '../../../shared/components/Feedback'
import { useBodyClass } from '../../../shared/hooks/useBodyClass'

type Props = { title: string; intro?: ReactNode; error?: string; onSubmit: (e: FormEvent) => void; children: ReactNode; foot?: ReactNode }

/** Centred card every login / signup step uses: logo, title, fields, error, footer links. */
export function AuthCard({ title, intro, error, onSubmit, children, foot }: Props) {
  useBodyClass('admin-mode')
  return (
    <CenterScreen>
      {/* noValidate: our own messages (useForm) replace the browser's bubbles */}
      <form onSubmit={onSubmit} noValidate>
        <Logo />
        <h1>{title}</h1>
        {intro && <p className="pt-muted">{intro}</p>}
        {children}
        <ErrorText>{error}</ErrorText>
        {foot}
      </form>
    </CenterScreen>
  )
}

export function AuthLink({ to, children }: { to: string; children: ReactNode }) {
  return <Link to={to} className="mono ad-back">{children}</Link>
}
