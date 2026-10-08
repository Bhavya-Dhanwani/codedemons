import type { ReactNode } from 'react'

/** Red error line; renders nothing when there's no error. Click to dismiss when `onDismiss` is given. */
export function ErrorText({ children, onDismiss, className }: { children?: ReactNode; onDismiss?: () => void; className?: string }) {
  if (!children) return null
  return <p className={['ad-err', className].filter(Boolean).join(' ')} onClick={onDismiss}>{children}</p>
}

export function EmptyState({ children }: { children: ReactNode }) {
  return <div className="ad-empty">{children}</div>
}

export function Muted({ children }: { children: ReactNode }) {
  return <p className="pt-muted">{children}</p>
}

export function Loading({ children = 'Loading' }: { children?: ReactNode }) {
  return <p className="mono pt-muted">{children}</p>
}

/** Full screen centred box: login forms, loading screens. */
export function CenterScreen({ children }: { children: ReactNode }) {
  return <main className="ad-login">{children}</main>
}
