import { api } from '../../../shared/api/api'

type Token = { token: string }
export type SignupBody = { name: string; email: string; company: string; phone: string }

export const authApi = {
  adminLogin: (body: { email: string; password: string }) => api.post<Token>('/admin/login', body),
  /** emails a 6 digit code if the address has a portal */
  requestCode: (email: string) => api.post('/portal/code', { email }),
  portalLogin: (body: { email: string; code: string }) => api.post<Token>('/portal/login', body),
  /** creates the client (a new lead in the CRM) and emails a code */
  signup: (body: SignupBody) => api.post('/portal/signup', body),
}
