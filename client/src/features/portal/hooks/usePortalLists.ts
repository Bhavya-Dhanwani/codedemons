import { useEffect } from 'react'
import { useNavigate } from 'react-router'
import { useQueryClient } from '@tanstack/react-query'
import { day, inr } from '../../../shared/lib/format'
import type { Me, PortalDocRow, PortalInvoice } from '../types'
import { ME_KEY } from './usePortalLayout'

/** Coming back to a list (e.g. after signing or paying): refresh what the portal knows. */
function useFreshMe() {
  const qc = useQueryClient()
  useEffect(() => { qc.invalidateQueries({ queryKey: ME_KEY }) }, [qc])
}

const docRow = (d: PortalDocRow) => ({
  ...d,
  statusText: d.status === 'sent' ? 'Needs your signature' : 'Signed',
  whenText: d.status === 'signed' ? day(d.them?.at, 'long') : `Sent ${day(d.sentAt, 'long')}`,
})

export function useDocumentList(me: Me) {
  useFreshMe()
  const navigate = useNavigate()
  return { docs: me.docs.map(docRow), open: (id: string) => navigate(`/portal/documents/${id}`) }
}

const invoiceStatus = (i: PortalInvoice) =>
  i.status === 'due' ? (new Date(i.dueAt) < new Date() ? 'Overdue' : `Due ${day(i.dueAt, 'long')}`) : i.status === 'verifying' ? 'Confirming' : 'Paid'

const SITE: Record<string, [string, string]> = {
  active: ['ok', 'Live'],
  grace: ['warn', 'Live, but a payment is overdue'],
}

export function useInvoiceList(me: Me) {
  useFreshMe()
  const navigate = useNavigate()
  const l = me.license
  const [tone, text] = (l && SITE[l.state]) || ['bad', 'Paused until payment']
  return {
    invoices: me.invoices.map((i) => ({ ...i, amountText: inr(i.amount), statusText: invoiceStatus(i) })),
    open: (id: string) => navigate(`/portal/payments/${id}`),
    site: l && {
      tone, text,
      label: `Your website${l.domain ? `, ${l.domain}` : ''}`,
      paid: l.paidUntil ? `Plan paid until ${day(l.paidUntil, 'long')}` : '',
    },
  }
}
