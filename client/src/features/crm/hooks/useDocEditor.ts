import { useCallback, useEffect, useRef, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { streamText } from '../../../shared/api/api'
import { useToast } from '../../../shared/hooks/useToast'
import { parseDoc, tidy, words } from '../../../shared/lib/markdown'
import { label } from '../../../shared/lib/format'
import type { DocFull, Signature } from '../../../shared/types/content'
import { crmApi } from '../api/crm.api'
import type { Client } from '../types'
import type { ClientActions } from './useClientActions'
import { crmKeys } from './keys'

type Edit = { title: string; body: string }
export const QUICK_ASKS = ['Make it shorter and simpler', 'Make it more formal', 'Add a payment schedule', 'Add a week by week timeline', 'Fix grammar and tone']
const AI_ERROR = /\n*\[\[AI error: (.*)\]\]$/s

/**
 * The full screen document editor: type on the paper (or in markdown), autosave, AI writer, outline,
 * then sign as the studio, send, download, delete.
 */
export function useDocEditor(id: string, c: Client, a: ClientActions, onBack: () => void, autoWrite?: string) {
  const toast = useToast()
  const qc = useQueryClient()
  const key = crmKeys.doc(id)
  const q = useQuery({ queryKey: key, queryFn: () => crmApi.doc(id) })
  const doc = q.data
  // unsaved changes; null = showing the server copy as is
  const [draft, setDraft] = useState<Edit | null>(null)
  const [mode, setMode] = useState<'paper' | 'markdown'>('paper')
  const [saving, setSaving] = useState<'idle' | 'saving' | 'error'>('idle')
  const [signing, setSigning] = useState(false)
  const [ask, setAsk] = useState(autoWrite ?? '')
  const [project, setProject] = useState(c.projects[0]?._id ?? '')
  const [writing, setWriting] = useState(false)
  const [aiError, setAiError] = useState('')
  const [before, setBefore] = useState<Edit | null>(null) // to undo the last AI write
  const stop = useRef<AbortController | null>(null)
  useEffect(() => { if (q.error) toast(q.error.message) }, [q.error, toast])

  const edit = draft ?? { title: doc?.title ?? '', body: doc?.body ?? '' }
  const isDraft = doc?.status === 'draft'
  const dirty = !!doc && (edit.title !== doc.title || edit.body !== doc.body)

  const save = useCallback(async () => {
    if (!doc || !dirty || !edit.title.trim()) return true
    setSaving('saving')
    try {
      await crmApi.saveDoc(id, edit)
      // the server clears our signature when the text changes
      qc.setQueryData<DocFull>(key, (d) => d && { ...d, ...edit, us: {} })
      setSaving('idle')
      return true
    } catch (e) { setSaving('error'); toast((e as Error).message); return false }
  }, [doc, dirty, edit, id, qc, key, toast])

  // autosave a moment after typing stops (not while the AI is still writing)
  useEffect(() => {
    if (!dirty || writing || !isDraft) return
    const t = setTimeout(save, 1200)
    return () => clearTimeout(t)
  }, [dirty, writing, isDraft, save])

  const write = useCallback(async (instructions: string, revise: boolean) => {
    if (!doc || writing) return
    const base = edit
    setBefore(base); setAiError(''); setWriting(true)
    stop.current = new AbortController()
    try {
      const text = await streamText('/admin/docs/write', {
        client: c._id, project, kind: doc.kind ? label(doc.kind) : base.title, instructions, draft: revise ? base.body : '',
      }, (t) => setDraft({ title: base.title, body: tidy(t.replace(AI_ERROR, '')) }), stop.current.signal)
      const err = text.match(AI_ERROR)
      if (err) setAiError(err[1])
      const body = tidy(text.replace(AI_ERROR, '')).trim()
      // a fresh draft names itself after its first heading
      const heading = parseDoc(body).find((b) => b.type === 'h2')
      setDraft({ title: !revise && heading && 'text' in heading ? heading.text.slice(0, 200) : base.title, body: body || base.body })
    } catch (e) {
      if ((e as Error).name !== 'AbortError') { setAiError((e as Error).message); setDraft(base); setBefore(null) }
    } finally { setWriting(false); stop.current = null }
  }, [doc, writing, edit, c._id, project])

  // "Generate with AI" from the template picker: start writing as soon as the doc is loaded
  const started = useRef(false)
  useEffect(() => {
    if (autoWrite && doc && !started.current) { started.current = true; write(autoWrite, false) }
  }, [autoWrite, doc, write])

  const blocks = parseDoc(edit.body)
  return {
    doc,
    shown: doc && { ...doc, ...edit },
    isDraft, mode, setMode, edit,
    setTitle: (title: string) => setDraft({ ...edit, title }),
    setBody: (body: string) => setDraft({ ...edit, body }),
    saveText: !isDraft ? '' : saving === 'saving' ? 'Saving' : saving === 'error' ? 'Not saved' : dirty ? 'Unsaved changes' : 'All changes saved',
    stats: `${words(edit.body)} words`,
    outline: blocks.flatMap((b) => (b.type === 'h2' || b.type === 'h3' ? [{ level: b.type, text: b.text }] : [])),
    ai: {
      on: c.ai, ask, setAsk, writing, error: aiError,
      projects: c.projects, project, setProject,
      hasText: blocks.length > 1,
      write: () => write(ask, false),
      revise: (instructions = ask) => write(instructions, true),
      stop: () => stop.current?.abort(),
      canUndo: !!before && !writing,
      undo: () => { if (before) { setDraft(before); setBefore(null) } },
    },
    canSign: !doc?.us?.at && !dirty,
    signing, toggleSigning: () => setSigning((s) => !s),
    sign: async (s: Signature) => { if (await a.signDoc(id, s)) { setSigning(false); await q.refetch() } },
    send: async () => { if (await save() && await a.sendDoc(id)) { await q.refetch(); setDraft(null) } },
    canDelete: doc?.status !== 'signed',
    remove: async () => { if (await a.deleteDoc(id)) onBack() },
    close: async () => { await save(); onBack() },
    // sent / signed docs are locked: copy them into a new draft to change anything
    duplicate: async () => {
      if (!doc) return null
      try { return (await crmApi.createDoc(c._id, { kind: doc.kind, title: `${doc.title} (v2)`, body: doc.body }))._id } catch (e) { toast((e as Error).message); return null }
    },
    sent: doc?.status === 'sent',
  }
}

export type DocEditorModel = ReturnType<typeof useDocEditor>
