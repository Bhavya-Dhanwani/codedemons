import type { Phase } from '../../shared/constants/site'
import type { Message } from '../../shared/components/Chat'

export type PortalInvoice = {
  _id: string; number: string; title: string; amount: number; dueAt: string
  status: 'due' | 'verifying' | 'paid'; paidAt: string | null
  /** upi:// link, only while due */
  upi: string
  /** Razorpay is set up: pay online instead of UPI QR + claim */
  auto: boolean
}

export type PortalDocRow = { _id: string; title: string; status: 'sent' | 'signed'; sentAt: string; them?: { at: string | null } }

export type ProjectRow = { _id: string; name: string; phase: string; unread: boolean; done: number; total: number; createdAt: string; updatedAt: string }

/** One project, both in the portal and the CRM. */
export type ProjectFull = {
  _id: string; name: string; brief: string; services: string[]; budget: string; deadline: string | null
  phase: Phase
  milestones: { title: string; done: boolean }[]
  updates: { _id: string; text: string; at: string }[]
  messages: Message[]
  seenAt: string | null
  createdAt: string
}

export type Me = {
  name: string; company: string
  projects: ProjectRow[]
  license: { state: string; domain: string; paidUntil: string | null } | null
  invoices: PortalInvoice[]
  docs: PortalDocRow[]
}
