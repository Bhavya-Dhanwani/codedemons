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

/** Documents tab: the list, the template / AI picker, or one open document. */
export function useDocsTab(c: Client) {
  const qc = useQueryClient()
  const toast = useToast()
  const [mode, setMode] = useState<'list' | 'pick' | string>('list')
  // AI: what kind of document and what it should say; the editor starts writing when it opens
  const [kind, setKind] = useState(TEMPLATES[0].kind)
  const [ask, setAsk] = useState('')
  const [autoWrite, setAutoWrite] = useState<string | undefined>()
  const reload = () => qc.invalidateQueries({ queryKey: crmKeys.client(c._id) })

  const create = useMutation({
    mutationFn: ({ t }: { t: Template; ai?: string }) => crmApi.createDoc(c._id, { kind: t.kind, title: t.title, body: fillTemplate(t.body, c) }),
    onSuccess: (d, { ai }) => { reload(); setAutoWrite(ai); setMode(d._id) },
    onError: (e) => toast(e.message),
  })
  const picked = TEMPLATES.find((t) => t.kind === kind) ?? BLANK_TEMPLATE

  return {
    mode, autoWrite,
    templates: [...TEMPLATES, BLANK_TEMPLATE],
    pickTemplate: () => setMode('pick'),
    create: (t: Template) => create.mutate({ t }),
    ai: {
      on: c.ai,
      kinds: TEMPLATES.map((t) => [t.kind, t.title] as const),
      kind, setKind, ask, setAsk,
      busy: create.isPending,
      // starts from the template so even a half-written AI draft has the right shape and title
      generate: () => create.mutate({ t: { ...picked, body: `# ${picked.title}` }, ai: ask.trim() || 'Write it for this client and project.' }),
    },
    open: (id: string) => { setAutoWrite(undefined); setMode(id) },
    back: () => { reload(); setAutoWrite(undefined); setMode('list') },
    heading: c.docs.length ? count(c.docs.length, 'document') : 'No documents yet',
    docs: c.docs.map((d) => ({ ...d, statusText: statusOf(d), whenText: whenOf(d) })),
  }
}
