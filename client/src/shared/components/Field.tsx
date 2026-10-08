import type { ReactNode } from 'react'

type Props = { label: ReactNode; hint?: string; error?: string; children: ReactNode; className?: string; as?: 'label' | 'div' }

/** Labelled form row; a validation error replaces the hint. Use as="div" when the control has its own buttons (a <label> forwards clicks). */
export function Field({ label, hint, error, children, className, as: Tag = 'label' }: Props) {
  return (
    <Tag className={['ad-field', className].filter(Boolean).join(' ')}>
      <span className="mono">{label}</span>
      {children}
      {error ? <small className="field-err" role="alert">{error}</small> : hint && <small>{hint}</small>}
    </Tag>
  )
}
