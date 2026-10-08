import { api } from '../../../shared/api/api'
import type { DocFull, Signature } from '../../../shared/types/content'
import type { Client, Row, Summary } from '../types'

const C = '/admin/clients'
type Created = { _id: string }

// Calls that change a client answer either the updated client or nothing; useClientActions handles both.
export const crmApi = {
  clients: (view: string, q: string) => api.get<Row[]>(C, { view, q }),
  summary: () => api.get<Summary>('/admin/crm/summary'),
  client: (id: string) => api.get<Client>(`${C}/${id}`),
  createLead: (body: object) => api.post<Created>(C, body),
  update: (id: string, body: object) => api.put<unknown>(`${C}/${id}`, body),
  remove: (id: string) => api.del<unknown>(`${C}/${id}`),

  addNote: (id: string, text: string) => api.post<unknown>(`${C}/${id}/notes`, { text }),
  postUpdate: (id: string, text: string) => api.post<unknown>(`${C}/${id}/updates`, { text }),
  invite: (id: string) => api.post<unknown>(`${C}/${id}/invite`),

  createInvoice: (id: string, body: object) => api.post<unknown>(`${C}/${id}/invoices`, body),
  markPaid: (invoiceId: string) => api.post<unknown>(`/admin/invoices/${invoiceId}/paid`),
  deleteInvoice: (invoiceId: string) => api.del<unknown>(`/admin/invoices/${invoiceId}`),

  /** creates the license, or replaces its key when there is one */
  makeLicense: (id: string) => api.post<unknown>(`${C}/${id}/license`),

  createDoc: (id: string, body: object) => api.post<Created>(`${C}/${id}/docs`, body),
  doc: (docId: string) => api.get<DocFull>(`/admin/docs/${docId}`),
  saveDoc: (docId: string, body: { title: string; body: string }) => api.put<unknown>(`/admin/docs/${docId}`, body),
  signDoc: (docId: string, sig: Signature) => api.post<unknown>(`/admin/docs/${docId}/sign`, sig),
  sendDoc: (docId: string) => api.post<unknown>(`/admin/docs/${docId}/send`),
  deleteDoc: (docId: string) => api.del<unknown>(`/admin/docs/${docId}`),
}
