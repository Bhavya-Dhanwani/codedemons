import type { FormEvent } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useForm } from '../../../shared/hooks/useForm'
import { email, required } from '../../../shared/lib/validators'
import { authApi } from '../api/auth.api'
import { useStartSession } from './useSession'

export function useAdminLogin() {
  const form = useForm({ email: '', password: '' }, { rules: { email, password: required('Enter your password') } })
  const start = useStartSession('admin')
  const login = useMutation({ mutationFn: authApi.adminLogin, onSuccess: ({ token }) => start(token) })
  return {
    field: form.field,
    errors: form.errors,
    // the password is sent exactly as typed
    submit: (e: FormEvent) => { e.preventDefault(); if (form.validate()) login.mutate({ email: form.values.email.trim(), password: form.values.password }) },
    busy: login.isPending,
    error: login.error?.message,
  }
}
