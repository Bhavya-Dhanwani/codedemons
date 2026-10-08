import type { FormEvent } from 'react'
import { Button } from '../../../shared/components/Button'

type Props = { value: string; onChange: (v: string) => void; onSubmit: (e: FormEvent) => void; placeholder: string; cta: string; rows?: number; primary?: boolean }

/** Textarea + button, for notes and client updates. */
export function NoteForm({ value, onChange, onSubmit, placeholder, cta, rows = 2, primary }: Props) {
  return (
    <form className="crm-note" onSubmit={onSubmit}>
      <textarea rows={rows} placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} />
      <Button type="submit" variant={primary ? 'primary' : undefined} disabled={!value.trim()}>{cta}</Button>
    </form>
  )
}
