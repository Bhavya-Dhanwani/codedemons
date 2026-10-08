import { useEffect, useState, type FormEvent } from 'react'
import { useParams, useSearchParams } from 'react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import QRCode from 'qrcode'
import { day, inr } from '../../../shared/lib/format'
import { isTouch } from '../../../shared/lib/media'
import { portalApi } from '../api/portal.api'
import { ME_KEY } from './usePortalLayout'

/** UPI QR code image for desktop. */
function useUpiQr(upi?: string) {
  const [qr, setQr] = useState('')
  useEffect(() => { if (upi) QRCode.toDataURL(upi, { margin: 1, width: 480 }).then(setQr) }, [upi])
  return qr
}

/**
 * Pay one invoice: online (Razorpay) when set up, else UPI (app link on phones, QR on desktop) + "I've paid" with the UTR.
 * Back from Razorpay (?paid) or after opening it, the invoice is polled until it shows paid.
 */
export function usePayment() {
  const { id = '' } = useParams()
  const [params] = useSearchParams()
  const qc = useQueryClient()
  const key = ['portal', 'invoice', id]
  const [waiting, setWaiting] = useState(params.has('paid'))
  const [claiming, setClaiming] = useState(false)
  const [utr, setUtr] = useState('')

  const inv = useQuery({
    queryKey: key,
    queryFn: () => portalApi.invoice(id),
    refetchInterval: (q) => (waiting && q.state.data?.status !== 'paid' ? 4000 : false),
  })
  const status = inv.data?.status
  useEffect(() => { if (status && status !== 'due') qc.invalidateQueries({ queryKey: ME_KEY }) }, [status, qc])

  const pay = useMutation({
    mutationFn: () => portalApi.pay(id),
    onSuccess: ({ url }) => { open(url, '_blank'); setWaiting(true) },
  })
  const claim = useMutation({
    mutationFn: () => portalApi.claim(id, utr),
    onSuccess: (fresh) => qc.setQueryData(key, fresh),
  })
  const qr = useUpiQr(inv.data?.upi)
  const i = inv.data

  return {
    inv: i,
    amount: i ? inr(i.amount) : '',
    paidText: i?.paidAt ? ` on ${day(i.paidAt, 'long')}` : '',
    online: !!i && i.status === 'due' && i.auto,
    upi: !!i && i.status === 'due' && !i.auto && !!i.upi,
    noMethod: !!i && i.status === 'due' && !i.auto && !i.upi,
    mobile: isTouch(),
    qr,
    pay: () => pay.mutate(),
    waiting,
    claiming, startClaim: () => setClaiming(true),
    utr, setUtr: (v: string) => setUtr(v.trim()),
    submitClaim: (e: FormEvent) => { e.preventDefault(); claim.mutate() },
    error: inv.error?.message || pay.error?.message || claim.error?.message,
  }
}
