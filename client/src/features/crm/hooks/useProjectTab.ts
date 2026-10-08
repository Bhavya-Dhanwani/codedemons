import { useState, type FormEvent } from 'react'
import { ago, firstName } from '../../../shared/lib/format'
import type { Phase } from '../../../shared/constants/site'
import type { Client, Milestone } from '../types'
import type { ClientActions } from './useClientActions'

/** Portal invite, phase, milestones the client sees, and posted updates. */
export function useProjectTab(c: Client, a: ClientActions) {
  const [milestone, setMilestone] = useState('')
  const [update, setUpdate] = useState('')
  const ms = c.milestones
  const saveMs = (next: Milestone[], msg: string) => a.patch({ milestones: next.map(({ title, done }) => ({ title, done })) }, msg)

  return {
    portal: c.portal,
    first: firstName(c.name),
    canInvite: !!c.email,
    invite: a.invite,
    setPhase: (p: Phase) => a.patch({ phase: p }, `Phase: ${p}`),
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
    postUpdate: async (e: FormEvent) => { e.preventDefault(); if (await a.postUpdate(update)) setUpdate('') },
    updateTime: ago,
  }
}
