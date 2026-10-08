import { useState, type FormEvent } from 'react'
import { useMutation } from '@tanstack/react-query'
import { adminApi } from '../api/admin.api'
import { bodyOf, type Item, type Resource } from '../config/resources'

/** Draft of one project / review in the editor drawer. */
export function useContentEditor(res: Resource, item: Item, onSaved: () => void) {
  const [d, setD] = useState<Item>({ ...res.blank, ...item })
  const set = (k: string, v: unknown) => setD((x) => ({ ...x, [k]: v }))
  const save = useMutation({ mutationFn: () => adminApi.save(res.path, item._id, bodyOf(res, d)), onSuccess: onSaved })
  return {
    d, set,
    /** comma separated text to a clean list */
    setList: (k: string, text: string) => set(k, text.split(',').map((s) => s.trim()).filter(Boolean)),
    title: item._id ? `Edit ${res.noun}` : `New ${res.noun}`,
    submit: (e: FormEvent) => { e.preventDefault(); save.mutate() },
    busy: save.isPending,
    error: save.error?.message,
  }
}
