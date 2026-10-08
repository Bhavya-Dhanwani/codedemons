import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useToast } from '../../../shared/hooks/useToast'
import type { Signature } from '../../../shared/types/content'
import { crmApi } from '../api/crm.api'
import type { ClientActions } from './useClientActions'
import { crmKeys } from './keys'

/** Write / preview a document, sign it as the studio, send it, delete it. */
export function useDocEditor(id: string, a: ClientActions, onBack: () => void) {
  const toast = useToast()
  const q = useQuery({ queryKey: crmKeys.doc(id), queryFn: () => crmApi.doc(id) })
  const doc = q.data
  // unsaved changes; null = showing the server copy as is
  const [draft, setDraft] = useState<{ title: string; body: string } | null>(null)
  const [picked, setView] = useState<'edit' | 'preview'>('edit')
  const [signing, setSigning] = useState(false)
  useEffect(() => { if (q.error) toast(q.error.message) }, [q.error, toast])

  const edit = draft ?? { title: doc?.title ?? '', body: doc?.body ?? '' }
  const isDraft = doc?.status === 'draft'
  const dirty = !!doc && (edit.title !== doc.title || edit.body !== doc.body)
  const after = async (ok: boolean) => { if (ok) { await q.refetch(); setDraft(null) } return ok }

  return {
    doc,
    shown: doc && { ...doc, ...edit },
    isDraft,
    // sent and signed documents can only be previewed
    view: isDraft ? picked : 'preview',
    setView, edit,
    setTitle: (title: string) => setDraft({ ...edit, title }),
    setBody: (body: string) => setDraft({ ...edit, body }),
    dirty,
    save: () => a.saveDoc(id, edit).then(after),
    canSign: !doc?.us?.at && !dirty,
    signing, toggleSigning: () => setSigning((s) => !s),
    sign: async (s: Signature) => { if (await a.signDoc(id, s)) { setSigning(false); await q.refetch() } },
    send: () => a.sendDoc(id).then(after),
    canDelete: doc?.status !== 'signed',
    remove: async () => { if (await a.deleteDoc(id)) onBack() },
    sent: doc?.status === 'sent',
  }
}
