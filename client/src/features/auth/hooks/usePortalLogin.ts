import type { FormEvent } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useForm } from '../../../shared/hooks/useForm'
import { email } from '../../../shared/lib/validators'
import { authApi } from '../api/auth.api'

/** Client login, step one: ask for a code by email. */
export function usePortalLogin() {
  const form = useForm({ email: '' }, { rules: { email } })
  const request = useMutation({ mutationFn: authApi.requestCode })
  return {
    field: form.field,
    errors: form.errors,
    email: form.values.email.trim(),
    submit: (e: FormEvent) => { e.preventDefault(); if (form.validate()) request.mutate(form.trimmed().email) },
    codeSent: request.isSuccess,
    back: () => request.reset(),
    busy: request.isPending,
    error: request.error?.message,
  }
}
