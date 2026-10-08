import type { ReactNode } from 'react'

/** Page heading in the admin and portal: title, a mono line under it, an optional action on the right. */
export function PanelHead({ title, sub, action }: { title: ReactNode; sub?: ReactNode; action?: ReactNode }) {
  return (
    <div className="ad-panel-head">
      <div>
        <h1>{title}</h1>
        {sub && <p className="mono">{sub}</p>}
      </div>
      {action}
    </div>
  )
}
