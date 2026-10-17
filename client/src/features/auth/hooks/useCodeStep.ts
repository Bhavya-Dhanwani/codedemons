import { useEffect, useState, type FormEvent } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useForm } from '../../../shared/hooks/useForm'
import { otp } from '../../../shared/lib/validators'
import { authApi } from '../api/auth.api'
import { useStartSession } from './useSession'

const WAIT = 30 // seconds before another code can be asked for

/** Second step of the client login and signup: swap the emailed 6 digit code for a session, or ask for a new one. */
export function useCodeStep(email: string) {
  const form = useForm({ code: '' }, { rules: { code: otp }, format: { code: (v) => v.replace(/\D/g, '').slice(0, 6) } })
  const start = useStartSession('portal')
  const login = useMutation({ mutationFn: authApi.portalLogin, onSuccess: ({ token }) => start(token) })

  // a code was just sent when this screen opened, so the countdown starts right away
  const [left, setLeft] = useState(WAIT)
  useEffect(() => {
    if (left <= 0) return
    const t = setTimeout(() => setLeft(left - 1), 1000)
    return () => clearTimeout(t)
  }, [left])
  const resend = useMutation({
    mutationFn: () => authApi.requestCode(email),
    onSuccess: () => { setLeft(WAIT); login.reset() },
  })

  return {
    field: form.field,
    errors: form.errors,
    submit: (e: FormEvent) => { e.preventDefault(); if (form.validate()) login.mutate({ email, code: form.values.code }) },
    busy: login.isPending,
    error: login.error?.message || resend.error?.message,
    resend: {
      text: resend.isPending ? 'Sending a new code' : left > 0 ? `Resend code in 0:${String(left).padStart(2, '0')}` : 'Resend code',
      disabled: left > 0 || resend.isPending,
      sent: resend.isSuccess && left > 0,
      go: () => resend.mutate(),
    },
  }
}
