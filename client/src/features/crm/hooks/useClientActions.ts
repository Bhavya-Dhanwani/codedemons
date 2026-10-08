import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { Signature } from '../../../shared/types/content'
import { useToast } from '../../../shared/hooks/useToast'
import { crmApi } from '../api/crm.api'
import type { Client } from '../types'
import { crmKeys } from './keys'

type Job = { call: () => Promise<unknown>; msg?: string }

/**
 * Every change to a client goes through here: call the API, merge the answer (or refetch), say what happened.
 * Each action resolves to true on success, so forms can reset themselves.
 */
export function useClientActions(id: string) {
  const qc = useQueryClient()
  const toast = useToast()
  const key = crmKeys.client(id)

  const job = useMutation({
    mutationFn: ({ call }: Job) => call(),
    onSuccess: async (res, { msg }) => {
      if (res && typeof res === 'object' && 'stage' in res) qc.setQueryData<Client>(key, (c) => c && { ...c, ...(res as Partial<Client>) })
      else await qc.invalidateQueries({ queryKey: key })
      if (msg) toast(msg)
    },
  })
  const run = (call: Job['call'], msg?: string) => job.mutateAsync({ call, msg }).then(() => true, () => false)

  return {
    error: job.error?.message,
    clearError: () => job.reset(),
    patch: (body: object, msg = 'Saved') => run(() => crmApi.update(id, body), msg),
    remove: () => run(() => crmApi.remove(id), 'Deleted'),
    addNote: (text: string) => run(() => crmApi.addNote(id, text), 'Note added'),
    postUpdate: (text: string) => run(() => crmApi.postUpdate(id, text), 'Update posted'),
    invite: () => run(() => crmApi.invite(id), 'Invite sent'),
    createInvoice: (body: object, msg: string) => run(() => crmApi.createInvoice(id, body), msg),
    markPaid: (invoiceId: string) => run(() => crmApi.markPaid(invoiceId), 'Marked as paid'),
    deleteInvoice: (invoiceId: string) => run(() => crmApi.deleteInvoice(invoiceId), 'Deleted'),
    makeLicense: (msg: string) => run(() => crmApi.makeLicense(id), msg),
    saveDoc: (docId: string, body: { title: string; body: string }) => run(() => crmApi.saveDoc(docId, body), 'Draft saved'),
    signDoc: (docId: string, sig: Signature) => run(() => crmApi.signDoc(docId, sig), 'Signed'),
    sendDoc: (docId: string) => run(() => crmApi.sendDoc(docId), 'Sent, they got an email'),
    deleteDoc: (docId: string) => run(() => crmApi.deleteDoc(docId), 'Deleted'),
  }
}

export type ClientActions = ReturnType<typeof useClientActions>
