import { useQuery } from '@tanstack/react-query'
import { homeApi } from '../api/home.api'

export const REVIEWS_KEY = ['reviews']

/** Published video reviews; empty while loading or if the API is down (the section just hides). */
export function useReviews() {
  const q = useQuery({ queryKey: REVIEWS_KEY, queryFn: homeApi.reviews, staleTime: Infinity })
  return q.data ?? []
}
