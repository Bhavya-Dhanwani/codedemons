import type { FormEvent } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useForm } from '../../../shared/hooks/useForm'
import { email, name, optionalPhone, optionalText } from '../../../shared/lib/validators'
import { authApi } from '../api/auth.api'

/** Client signup, step one: create the account, which emails a code. */
export function useSignup() {
  const form = useForm(
    { name: '', email: '', company: '', phone: '', website: '' },
    { rules: { name, email, company: optionalText(120, 'Company'), phone: optionalPhone } },
  )
  const signup = useMutation({ mutationFn: authApi.signup })
  return {
    field: form.field,
    errors: form.errors,
    email: form.values.email.trim(),
    submit: (e: FormEvent) => { e.preventDefault(); if (form.validate()) signup.mutate(form.trimmed()) },
    codeSent: signup.isSuccess,
    back: () => signup.reset(),
    busy: signup.isPending,
    error: signup.error?.message,
  }
}
