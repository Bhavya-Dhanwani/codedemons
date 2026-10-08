import { api } from '../../../shared/api/api'
import type { Review } from '../../../shared/types/content'

export type ContactBody = { name: string; email: string; company?: string; message: string; website?: string; services: string[] }

export const homeApi = {
  reviews: () => api.get<Review[]>('/reviews'),
  contact: (body: ContactBody) => api.post('/contact', body),
}
