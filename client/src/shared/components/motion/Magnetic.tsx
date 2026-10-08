import type { ReactNode } from 'react'
import { useMagnetic } from '../../hooks/useMotion'

/** Element that gets pulled toward the cursor. */
export function Magnetic({ children, strength = 0.35 }: { children: ReactNode; strength?: number }) {
  const magnet = useMagnetic<HTMLDivElement>(strength)
  return <div className="magnetic" {...magnet}>{children}</div>
}
