import { useState, type ChangeEvent, type FormEvent } from 'react'
import { ago, isoDay, label, plusDays } from '../../../shared/lib/format'
import { STAGES } from '../constants'
import type { Client, Stage } from '../types'
import type { ClientActions } from './useClientActions'

/** Stage, follow up date, notes and contact details. */
export function useOverviewTab(c: Client, a: ClientActions, onDeleted: () => void) {
  const [d, setD] = useState({ name: c.name, email: c.email, phone: c.phone, company: c.company, value: String(c.value || '') })
  const [note, setNote] = useState('')
  const dirty = d.name !== c.name || d.email !== c.email || d.phone !== c.phone || d.company !== c.company || Number(d.value || 0) !== c.value

  return {
    stages: STAGES.map((s) => ({
      s, on: c.stage === s,
      text: s === 'won' ? 'Won' : label(s),
      pick: () => a.patch({ stage: s, ...(s === 'lost' ? { followUpAt: null } : {}) }, `Moved to ${s === 'won' ? 'clients' : s}`),
    })),
    followUp: {
      value: isoDay(c.followUpAt),
      set: (v: string) => a.patch({ followUpAt: v || null }, 'Follow up set'),
      tomorrow: () => a.patch({ followUpAt: plusDays(1) }, 'Follow up tomorrow'),
      nextWeek: () => a.patch({ followUpAt: plusDays(7) }, 'Follow up next week'),
      done: c.followUpAt ? () => a.patch({ followUpAt: null }, 'Follow up cleared') : null,
    },
    note, setNote,
    addNote: async (e: FormEvent) => { e.preventDefault(); if (await a.addNote(note)) setNote('') },
    noteTime: ago,
    theirMessageLabel: `Their message${c.services.length ? `, about ${c.services.join(', ')}` : ''}`,
    field: (k: keyof typeof d) => ({ value: d[k], onChange: (e: ChangeEvent<HTMLInputElement>) => setD({ ...d, [k]: e.target.value }) }),
    dirty,
    saveDetails: () => a.patch({ ...d, value: Number(d.value) || 0 }),
    remove: async () => { if (await a.remove()) onDeleted() },
  }
}

export type StageOption = { s: Stage; on: boolean; text: string; pick: () => void }
