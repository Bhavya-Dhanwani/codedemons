import { api } from '../../../shared/api/api'
import type { DocFull, Signature } from '../../../shared/types/content'
import type { Me, PortalInvoice, ProjectFull } from '../types'

export const portalApi = {
  me: () => api.get<Me>('/portal/me'),
  createProject: (body: object) => api.post<{ _id: string }>('/portal/projects', body),
  project: (id: string) => api.get<ProjectFull>(`/portal/projects/${id}`),
  sendMessage: (id: string, text: string) => api.post<ProjectFull>(`/portal/projects/${id}/messages`, { text }),
  doc: (id: string) => api.get<DocFull>(`/portal/docs/${id}`),
  signDoc: (id: string, sig: Signature) => api.post(`/portal/docs/${id}/sign`, sig),
  invoice: (id: string) => api.get<PortalInvoice>(`/portal/invoices/${id}`),
  /** Razorpay payment page URL */
  pay: (id: string) => api.post<{ url: string }>(`/portal/invoices/${id}/pay`),
  /** "I've paid" by UPI: send the UTR, get the invoice back as "verifying" */
  claim: (id: string, utr: string) => api.post<PortalInvoice>(`/portal/invoices/${id}/claim`, { utr }),
}
