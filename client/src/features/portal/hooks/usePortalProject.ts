import { useEffect } from 'react'
import { useParams } from 'react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ago, day } from '../../../shared/lib/format'
import { portalApi } from '../api/portal.api'
import type { ProjectFull } from '../types'
import { ME_KEY } from './usePortalLayout'

/** One project: stage, milestones, updates and the conversation (checked for new messages every 8s). */
export function usePortalProject() {
  const { id = '' } = useParams()
  const qc = useQueryClient()
  const key = ['portal', 'project', id]
  const q = useQuery({ queryKey: key, queryFn: () => portalApi.project(id), refetchInterval: 8000 })
  const p = q.data
  // opening it marks our messages read: refresh the badges
  const count = p?.messages.length
  useEffect(() => { if (count !== undefined) qc.invalidateQueries({ queryKey: ME_KEY }) }, [count, qc])
  const send = useMutation({
    mutationFn: (text: string) => portalApi.sendMessage(id, text),
    onSuccess: (fresh) => qc.setQueryData<ProjectFull>(key, fresh),
  })
  const done = p?.milestones.filter((m) => m.done).length ?? 0
  return {
    p,
    error: q.error?.message || send.error?.message,
    started: p ? `Started ${day(p.createdAt, 'long')}` : '',
    details: p ? [
      p.services.length ? ['Services', p.services.join(', ')] : null,
      p.budget ? ['Budget', p.budget] : null,
      p.deadline ? ['Wanted by', day(p.deadline, 'long')] : null,
    ].filter((x): x is string[] => !!x) : [],
    progress: { text: `${done} of ${p?.milestones.length ?? 0} done`, pct: p?.milestones.length ? Math.round((done / p.milestones.length) * 100) : 0 },
    send: (text: string) => send.mutateAsync(text).then(() => true, () => false),
    updateTime: ago,
  }
}
