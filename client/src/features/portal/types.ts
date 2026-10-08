export type PortalInvoice = {
  _id: string; number: string; title: string; amount: number; dueAt: string
  status: 'due' | 'verifying' | 'paid'; paidAt: string | null
  /** upi:// link, only while due */
  upi: string
  /** Razorpay is set up: pay online instead of UPI QR + claim */
  auto: boolean
}

export type PortalDocRow = { _id: string; title: string; status: 'sent' | 'signed'; sentAt: string; them?: { at: string | null } }

export type Me = {
  name: string; company: string; phase: string
  milestones: { title: string; done: boolean }[]
  updates: { _id: string; text: string; at: string }[]
  license: { state: string; domain: string; paidUntil: string | null } | null
  invoices: PortalInvoice[]
  docs: PortalDocRow[]
}
