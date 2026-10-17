import { useState, type ChangeEvent, type FormEvent } from 'react'
import { useNavigate } from 'react-router'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { portalApi } from '../api/portal.api'
import { ME_KEY } from './usePortalLayout'

export const SERVICE_OPTIONS = ['Website', 'Web app', 'E-commerce', 'UI / UX design', 'Branding', '3D & Motion', 'SEO & growth', 'Maintenance']
export const BUDGETS = ['', 'Under ₹50k', '₹50k to ₹1L', '₹1L to ₹3L', '₹3L to ₹10L', 'Above ₹10L', 'Not sure yet']

const blank = { name: '', brief: '', budget: '', deadline: '' }

/** "Start a project": what they need, which services, budget and when. Lands on the new project. */
export function useNewProject() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [d, setD] = useState(blank)
  const [services, setServices] = useState<string[]>([])
  const create = useMutation({
    mutationFn: () => portalApi.createProject({ ...d, services, deadline: d.deadline || null }),
    onSuccess: async ({ _id }) => { await qc.invalidateQueries({ queryKey: ME_KEY }); navigate(`/portal/projects/${_id}`) },
  })
  return {
    field: (k: keyof typeof blank) => ({ value: d[k], onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setD({ ...d, [k]: e.target.value }) }),
    services: SERVICE_OPTIONS.map((s) => ({ s, on: services.includes(s), toggle: () => setServices((x) => (x.includes(s) ? x.filter((y) => y !== s) : [...x, s])) })),
    budgets: BUDGETS,
    canSubmit: d.name.trim().length >= 2 && d.brief.trim().length >= 10 && !create.isPending,
    busy: create.isPending,
    submit: (e: FormEvent) => { e.preventDefault(); create.mutate() },
    error: create.error?.message,
  }
}
