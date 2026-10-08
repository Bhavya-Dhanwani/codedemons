import type { ButtonHTMLAttributes } from 'react'

/** Pill toggle used for filters. */
export function Chip({ on, className, ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { on: boolean }) {
  return <button type="button" className={['chip', on && 'on', className].filter(Boolean).join(' ')} {...rest} />
}
