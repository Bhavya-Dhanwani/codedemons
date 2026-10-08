import { useState, type ChangeEvent } from 'react'
import type { Rule } from '../lib/validators'

type Options<K extends string> = {
  rules: Partial<Record<K, Rule>>
  /** clean a value as it's typed, e.g. digits only */
  format?: Partial<Record<K, (v: string) => string>>
}

/**
 * Controlled form with per-field errors. An error shows when you leave a filled field or submit,
 * then updates live as you fix it. `validate()` checks everything and focuses the first bad field.
 */
export function useForm<K extends string>(initial: Record<K, string>, { rules, format = {} }: Options<K>) {
  const [values, setValues] = useState(initial)
  const [errors, setErrors] = useState<Partial<Record<K, string>>>({})
  const check = (k: K, v: string) => rules[k]?.(v)

  const field = (k: K) => ({
    name: k,
    value: values[k],
    onChange: (e: ChangeEvent<HTMLInputElement>) => {
      const v = format[k]?.(e.target.value) ?? e.target.value
      setValues((s) => ({ ...s, [k]: v }))
      if (errors[k]) setErrors((s) => ({ ...s, [k]: check(k, v) }))
    },
    // don't nag about an empty field just because it was tabbed through
    onBlur: () => { if (values[k].trim()) setErrors((s) => ({ ...s, [k]: check(k, values[k]) })) },
    'aria-invalid': errors[k] ? true : undefined,
  })

  const validate = () => {
    const next: Partial<Record<K, string>> = {}
    for (const k of Object.keys(rules) as K[]) next[k] = check(k, values[k])
    setErrors(next)
    const first = (Object.keys(rules) as K[]).find((k) => next[k])
    if (first) document.querySelector<HTMLInputElement>(`[name="${first}"]`)?.focus()
    return !first
  }

  /** values with surrounding spaces removed, ready to send */
  const trimmed = () => Object.fromEntries(Object.entries(values).map(([k, v]) => [k, String(v).trim()])) as Record<K, string>

  return { values, errors, field, validate, trimmed }
}
