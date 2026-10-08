import { useState, type FormEvent } from 'react'
import { useMutation } from '@tanstack/react-query'
import { homeApi, type ContactBody } from '../api/home.api'

/** Contact form: picked service chips + the form fields, posted to /contact. */
export function useContactForm() {
  const [picked, setPicked] = useState<string[]>([])
  const send = useMutation({ mutationFn: homeApi.contact })

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fields = Object.fromEntries(new FormData(e.currentTarget)) as Omit<ContactBody, 'services'>
    send.mutate({ ...fields, services: picked })
  }

  return {
    isPicked: (t: string) => picked.includes(t),
    togglePick: (t: string) => setPicked((p) => (p.includes(t) ? p.filter((x) => x !== t) : [...p, t])),
    submit,
    sending: send.isPending,
    sent: send.isSuccess,
    error: send.error?.message ?? '',
  }
}
