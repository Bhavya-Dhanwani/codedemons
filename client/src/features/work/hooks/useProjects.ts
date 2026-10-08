import { useQuery } from '@tanstack/react-query'
import { workApi } from '../api/work.api'

export const PROJECTS_KEY = ['projects']

/** Published projects, fetched once per visit. `null` while loading; an empty list if the API is down. */
export function useProjects() {
  const q = useQuery({ queryKey: PROJECTS_KEY, queryFn: workApi.projects, staleTime: Infinity })
  return q.isError ? [] : (q.data ?? null)
}
