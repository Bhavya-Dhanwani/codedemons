import { useParams } from 'react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Signature } from '../../../shared/types/content'
import { portalApi } from '../api/portal.api'
import { ME_KEY } from './usePortalLayout'

/** One document: read it, sign it, download it. */
export function usePortalDoc() {
  const { id = '' } = useParams()
  const qc = useQueryClient()
  const key = ['portal', 'doc', id]
  const doc = useQuery({ queryKey: key, queryFn: () => portalApi.doc(id) })
  const sign = useMutation({
    mutationFn: (s: Signature) => portalApi.signDoc(id, s),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: key })
      qc.invalidateQueries({ queryKey: ME_KEY })
    },
  })
  return {
    doc: doc.data,
    sign: sign.mutate,
    signing: sign.isPending,
    error: doc.error?.message || sign.error?.message,
  }
}
