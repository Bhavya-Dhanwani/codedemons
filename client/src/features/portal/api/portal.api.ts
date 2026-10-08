import { api } from '../../../shared/api/api'
import type { DocFull, Signature } from '../../../shared/types/content'
import type { Me, PortalInvoice } from '../types'

export const portalApi = {
  me: () => api.get<Me>('/portal/me'),
  doc: (id: string) => api.get<DocFull>(`/portal/docs/${id}`),
  signDoc: (id: string, sig: Signature) => api.post(`/portal/docs/${id}/sign`, sig),
  invoice: (id: string) => api.get<PortalInvoice>(`/portal/invoices/${id}`),
  /** Razorpay payment page URL */
  pay: (id: string) => api.post<{ url: string }>(`/portal/invoices/${id}/pay`),
  /** "I've paid" by UPI: send the UTR, get the invoice back as "verifying" */
  claim: (id: string, utr: string) => api.post<PortalInvoice>(`/portal/invoices/${id}/claim`, { utr }),
}
