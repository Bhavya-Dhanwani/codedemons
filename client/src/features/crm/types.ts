import type { Phase } from '../../shared/constants/site'
import type { STAGES } from './constants'

export type Stage = (typeof STAGES)[number]
export type LicenseState = 'none' | 'off' | 'expired' | 'grace' | 'active'

export type Row = { _id: string; name: string; email: string; company: string; stage: Stage; value: number; followUpAt: string | null; portal: boolean; source: string }
export type Invoice = { _id: string; number: string; title: string; amount: number; dueAt: string; status: 'due' | 'verifying' | 'paid'; utr: string; paidAt: string | null; licenseDays: number }
export type DocRow = { _id: string; title: string; kind: string; status: 'draft' | 'sent' | 'signed'; sentAt: string | null; us?: { at: string | null }; them?: { at: string | null } }
/** What visitors see while the client's site is down. */
export type MaintenancePage = { heading: string; logo: string; bg: string; fg: string; accent: string; buttonLabel: string; buttonUrl: string }
export type License = { key: string; domain: string; on: boolean; paidUntil: string | null; graceDays: number; message: string; page?: Partial<MaintenancePage> }
export type Milestone = { title: string; done: boolean }

export type Client = Row & {
  phone: string; message: string; services: string[]; createdAt: string
  notes: { _id: string; text: string; at: string }[]
  phase: Phase; milestones: Milestone[]; updates: { _id: string; text: string; at: string }[]
  license: License; licenseState: LicenseState
  invoices: Invoice[]; docs: DocRow[]
}

export type Summary = { due: number; openValue: number; openCount: number; unpaidValue: number; unpaidCount: number; receivedThisMonth: number }

export type Template = { kind: string; title: string; hint: string; body: string }
