import type { FormEvent } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useForm } from '../../../shared/hooks/useForm'
import { otp } from '../../../shared/lib/validators'
import { authApi } from '../api/auth.api'
import { useStartSession } from './useSession'

/** Second step of the client login and signup: swap the emailed 6 digit code for a session. */
export function useCodeStep(email: string) {
  const form = useForm({ code: '' }, { rules: { code: otp }, format: { code: (v) => v.replace(/\D/g, '').slice(0, 6) } })
  const start = useStartSession('portal')
  const login = useMutation({ mutationFn: authApi.portalLogin, onSuccess: ({ token }) => start(token) })
  return {
    field: form.field,
    errors: form.errors,
    submit: (e: FormEvent) => { e.preventDefault(); if (form.validate()) login.mutate({ email, code: form.values.code }) },
    busy: login.isPending,
    error: login.error?.message,
  }
}
