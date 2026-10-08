import { useState, type ChangeEvent, type FormEvent } from 'react'
import { count, day, inr, label, plusDays } from '../../../shared/lib/format'
import type { Client, Invoice } from '../types'
import type { ClientActions } from './useClientActions'

const blank = () => ({ title: '', amount: '', dueAt: plusDays(7), licenseDays: '0' })
type Form = ReturnType<typeof blank>

const rowOf = (i: Invoice) => ({
  ...i,
  amountText: inr(i.amount),
  sub: [i.number, i.status === 'paid' ? `Paid ${day(i.paidAt)}` : `Due ${day(i.dueAt)}`, i.utr && `Ref ${i.utr}`].filter(Boolean).join('  ·  '),
  statusText: i.status === 'verifying' ? 'Check your bank' : label(i.status),
  open: i.status !== 'paid',
})
export type InvoiceRowData = ReturnType<typeof rowOf>

/** Invoices: create (with optional license extension), mark paid, delete. */
export function usePaymentsTab(c: Client, a: ClientActions) {
  const [adding, setAdding] = useState(!c.invoices.length)
  const [d, setD] = useState(blank)

  return {
    adding,
    startAdding: () => setAdding(true),
    cancel: () => setAdding(false),
    canCancel: c.invoices.length > 0,
    heading: count(c.invoices.length, 'invoice'),
    field: (k: keyof Form) => ({ value: d[k], onChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setD({ ...d, [k]: e.target.value }) }),
    hasLicense: !!c.license.key,
    hint: c.portal ? 'They get an email now and a reminder 3 days before it is due.' : 'Invite them to the portal so they can pay it.',
    submit: async (e: FormEvent) => {
      e.preventDefault()
      const ok = await a.createInvoice({ ...d, amount: Number(d.amount), licenseDays: Number(d.licenseDays) }, c.portal ? 'Invoice sent to client' : 'Invoice created')
      if (ok) { setAdding(false); setD(blank()) }
    },
    invoices: c.invoices.map(rowOf),
    markPaid: a.markPaid,
    remove: a.deleteInvoice,
  }
}
