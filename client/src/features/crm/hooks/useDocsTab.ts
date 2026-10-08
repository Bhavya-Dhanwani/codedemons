import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useToast } from '../../../shared/hooks/useToast'
import { count, day, label } from '../../../shared/lib/format'
import { crmApi } from '../api/crm.api'
import { BLANK_TEMPLATE, TEMPLATES, fillTemplate } from '../templates'
import type { Client, DocRow, Template } from '../types'
import { crmKeys } from './keys'

const statusOf = (d: DocRow) => (d.status === 'sent' ? 'Waiting for signature' : label(d.status))
const whenOf = (d: DocRow) => (d.status === 'signed' ? `Signed ${day(d.them?.at)}` : d.sentAt ? `Sent ${day(d.sentAt)}` : '')

/** Documents tab: the list, the template picker, or one open document. */
export function useDocsTab(c: Client) {
  const qc = useQueryClient()
  const toast = useToast()
  const [mode, setMode] = useState<'list' | 'pick' | string>('list')
  const reload = () => qc.invalidateQueries({ queryKey: crmKeys.client(c._id) })

  const create = useMutation({
    mutationFn: (t: Template) => crmApi.createDoc(c._id, { kind: t.kind, title: t.title, body: fillTemplate(t.body, c) }),
    onSuccess: (d) => { reload(); setMode(d._id) },
    onError: (e) => toast(e.message),
  })

  return {
    mode,
    templates: [...TEMPLATES, BLANK_TEMPLATE],
    pickTemplate: () => setMode('pick'),
    create: create.mutate,
    open: setMode,
    back: () => { reload(); setMode('list') },
    heading: c.docs.length ? count(c.docs.length, 'document') : 'No documents yet',
    docs: c.docs.map((d) => ({ ...d, statusText: statusOf(d), whenText: whenOf(d) })),
  }
}
