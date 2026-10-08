import { useCallback, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useToast } from '../../../shared/hooks/useToast'
import { adminApi } from '../api/admin.api'
import { bodyOf, type Item, type Resource } from '../config/resources'

/** Projects / reviews list: load, reorder (buttons or drag), publish toggle, delete, open the editor. */
export function useContentList(res: Resource) {
  const qc = useQueryClient()
  const toast = useToast()
  const key = ['admin', res.path]
  const list = useQuery({ queryKey: key, queryFn: () => adminApi.list(res.path) })
  const [edit, setEdit] = useState<Item | null>(null)
  const [err, setErr] = useState('')
  const drag = useRef<number | null>(null)

  // the public site caches its lists; refresh them too
  const refresh = () => {
    qc.invalidateQueries({ queryKey: key })
    qc.invalidateQueries({ queryKey: [res.publicKey] })
  }
  const fail = (e: Error) => setErr(e.message)

  const reorder = useMutation({
    mutationFn: (next: Item[]) => adminApi.reorder(res.path, next.map((i) => i._id!)),
    onMutate: (next) => qc.setQueryData(key, next),
    onSuccess: () => { qc.invalidateQueries({ queryKey: [res.publicKey] }); toast('Order saved') },
    onError: (e) => { fail(e); refresh() },
  })
  const remove = useMutation({
    mutationFn: (i: Item) => adminApi.remove(res.path, i._id!),
    onSuccess: (_, i) => { toast(`Deleted ${res.name(i)}`); refresh() },
    onError: fail,
  })
  const togglePublish = useMutation({
    mutationFn: (i: Item) => adminApi.save(res.path, i._id, { ...bodyOf(res, i), published: !i.published }),
    onSuccess: refresh,
    onError: fail,
  })

  const items = list.data
  const move = (from: number, to: number) => {
    if (!items || to < 0 || to >= items.length || from === to) return
    const next = [...items]
    next.splice(to, 0, next.splice(from, 1)[0])
    reorder.mutate(next)
  }

  return {
    items,
    summary: items ? `${items.length} total, drag to reorder` : 'Loading',
    error: err || list.error?.message,
    clearError: () => setErr(''),
    move,
    dragProps: (k: number) => ({
      draggable: true,
      onDragStart: () => { drag.current = k },
      onDragOver: (e: { preventDefault: () => void }) => e.preventDefault(),
      onDrop: () => { if (drag.current !== null) move(drag.current, k); drag.current = null },
    }),
    remove: remove.mutate,
    togglePublish: togglePublish.mutate,
    editing: edit,
    openNew: () => setEdit({ ...res.blank }),
    openEdit: setEdit,
    closeEditor: useCallback(() => setEdit(null), []),
    onSaved: () => { setEdit(null); toast('Saved'); refresh() },
  }
}
