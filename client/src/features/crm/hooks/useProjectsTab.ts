import { useEffect, useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useToast } from '../../../shared/hooks/useToast'
import { ago, count, day, firstName, label } from '../../../shared/lib/format'
import type { Phase } from '../../../shared/constants/site'
import type { ProjectFull } from '../../portal/types'
import { crmApi } from '../api/crm.api'
import type { Client, Milestone } from '../types'
import { crmKeys } from './keys'

/** Projects tab: portal invite, the client's projects, a new one. */
export function useProjectsTab(c: Client) {
  const qc = useQueryClient()
  const toast = useToast()
  const [open, setOpen] = useState<string | null>(c.projects.length === 1 ? c.projects[0]._id : null)
  const [name, setName] = useState('')
  const reload = () => qc.invalidateQueries({ queryKey: crmKeys.client(c._id) })
  const create = useMutation({
    mutationFn: () => crmApi.createProject(c._id, { name: name.trim() }),
    onSuccess: ({ _id }) => { reload(); setName(''); setOpen(_id); toast('Project created') },
    onError: (e) => toast(e.message),
  })
  return {
    first: firstName(c.name),
    open, setOpen,
    back: () => { reload(); setOpen(null) },
    heading: c.projects.length ? count(c.projects.length, 'project') : 'No projects yet',
    rows: c.projects.map((p) => ({ ...p, phaseText: label(p.phase), sub: p.total ? `${p.done} of ${p.total} milestones` : `Started ${day(p.createdAt)}` })),
    name, setName,
    create: (e: FormEvent) => { e.preventDefault(); if (name.trim().length >= 2) create.mutate() },
  }
}

/** One project from the studio side: conversation, phase, milestones, updates, brief. */
export function useProjectDetail(id: string, onDeleted: () => void) {
  const qc = useQueryClient()
  const toast = useToast()
  const key = crmKeys.project(id)
  const q = useQuery({ queryKey: key, queryFn: () => crmApi.project(id), refetchInterval: 8000 })
  const p = q.data
  // opening it marks their messages read: refresh the unread badges (tab, list, sidebar)
  const seen = p?.messages.length
  useEffect(() => {
    if (seen === undefined) return
    qc.invalidateQueries({ queryKey: crmKeys.all })
  }, [seen, qc])
  const [milestone, setMilestone] = useState('')
  const [update, setUpdate] = useState('')
  const [brief, setBrief] = useState<{ name: string; brief: string } | null>(null)

  const job = useMutation({
    mutationFn: ({ call }: { call: () => Promise<ProjectFull | null>; msg?: string }) => call(),
    onSuccess: (fresh, { msg }) => { if (fresh) qc.setQueryData(key, fresh); if (msg) toast(msg) },
    onError: (e) => toast(e.message),
  })
  const run = (call: () => Promise<ProjectFull | null>, msg?: string) => job.mutateAsync({ call, msg }).then(() => true, () => false)
  const save = (body: object, msg = 'Saved') => run(() => crmApi.saveProject(id, body), msg)
  const ms = p?.milestones ?? []
  const saveMs = (next: Milestone[], msg: string) => save({ milestones: next.map(({ title, done }) => ({ title, done })) }, msg)
  const edit = brief ?? { name: p?.name ?? '', brief: p?.brief ?? '' }

  return {
    p,
    error: q.error?.message,
    send: (text: string) => run(() => crmApi.sendMessage(id, text)),
    setPhase: (ph: Phase) => save({ phase: ph }, `Phase: ${ph}`),
    milestones: ms.map((x, i) => ({
      ...x,
      toggle: () => saveMs(ms.map((y, j) => (j === i ? { ...y, done: !y.done } : y)), x.done ? 'Reopened' : 'Done'),
      remove: () => saveMs(ms.filter((_, j) => j !== i), 'Removed'),
    })),
    milestone, setMilestone,
    milestonePlaceholder: ms.length ? 'Add a milestone' : 'e.g. Homepage design approved',
    addMilestone: async (e: FormEvent) => {
      e.preventDefault()
      if (milestone.trim() && await saveMs([...ms, { title: milestone.trim(), done: false }], 'Milestone added')) setMilestone('')
    },
    update, setUpdate,
    postUpdate: async (e: FormEvent) => { e.preventDefault(); if (await run(() => crmApi.postUpdate(id, update), 'Update posted')) setUpdate('') },
    updateTime: ago,
    edit,
    setEdit: (k: 'name' | 'brief', v: string) => setBrief({ ...edit, [k]: v }),
    briefDirty: !!p && (edit.name !== p.name || edit.brief !== p.brief),
    saveBrief: async () => { if (await save({ name: edit.name, brief: edit.brief })) setBrief(null) },
    facts: p ? [p.services.join(', '), p.budget && `Budget ${p.budget}`, p.deadline && `Wanted by ${day(p.deadline)}`].filter(Boolean).join('  ·  ') : '',
    remove: async () => { if (await run(async () => { await crmApi.deleteProject(id); return null }, 'Project deleted')) onDeleted() },
  }
}
