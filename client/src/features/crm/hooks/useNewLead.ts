import { useState, type ChangeEvent, type FormEvent } from 'react'
import { useMutation } from '@tanstack/react-query'
import { plusDays } from '../../../shared/lib/format'
import { crmApi } from '../api/crm.api'

const blank = () => ({ name: '', email: '', phone: '', company: '', value: '', followUpAt: plusDays(1) })
type Form = ReturnType<typeof blank>

export function useNewLead(onSaved: (id: string) => void) {
  const [d, setD] = useState(blank)
  const create = useMutation({
    mutationFn: () => crmApi.createLead({ ...d, value: Number(d.value) || 0, followUpAt: d.followUpAt || null }),
    onSuccess: (c) => onSaved(c._id),
  })
  return {
    field: (k: keyof Form) => ({ value: d[k], onChange: (e: ChangeEvent<HTMLInputElement>) => setD({ ...d, [k]: e.target.value }) }),
    submit: (e: FormEvent) => { e.preventDefault(); create.mutate() },
    error: create.error?.message,
  }
}
