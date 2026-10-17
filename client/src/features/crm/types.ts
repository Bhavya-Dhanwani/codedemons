import type { ProjectRow } from '../portal/types'
import type { STAGES } from './constants'

export type Stage = (typeof STAGES)[number]
export type LicenseState = 'none' | 'off' | 'expired' | 'grace' | 'active'

export type Row = { _id: string; name: string; email: string; company: string; stage: Stage; value: number; followUpAt: string | null; portal: boolean; source: string; unread?: boolean }
export type Invoice = { _id: string; number: string; title: string; amount: number; dueAt: string; status: 'due' | 'verifying' | 'paid'; utr: string; paidAt: string | null; licenseDays: number }
export type DocRow = { _id: string; title: string; kind: string; status: 'draft' | 'sent' | 'signed'; sentAt: string | null; us?: { at: string | null }; them?: { at: string | null } }
/** What visitors see while the client's site is down. */
export type MaintenancePage = { heading: string; logo: string; bg: string; fg: string; accent: string; buttonLabel: string; buttonUrl: string; canvas?: Canvas | null }

/** Free-form maintenance page: a 1280x720 stage (see lib/canvas.ts and server license.page.ts). */
export type CanvasEl = {
  t: 'text' | 'image' | 'button' | 'box'
  x: number; y: number; w: number; h: number
  text: string; src: string; href: string
  size: number; weight: number; italic: boolean; font: 'sans' | 'serif' | 'mono' | 'round'; align: 'left' | 'center' | 'right'
  color: string; fill: string; radius: number; opacity: number; spacing: number; lh: number
  /** second fill colour = gradient at fangle; clip paints it into the letters (text) */
  fill2: string; fangle: number; clip: boolean
  /** border width (stage px) and colour, shadow strength 0..1, rotation in degrees */
  bw: number; bc: string; shadow: number; rot: number
  upper: boolean; underline: boolean; fit: 'contain' | 'cover'
}
export type Canvas = { bg: string; bg2: string; bg3?: string; bgType?: 'linear' | 'radial'; angle: number; img: string; dim: number; els: CanvasEl[] }
export type License = { key: string; domain: string; on: boolean; paidUntil: string | null; graceDays: number; message: string; page?: Partial<MaintenancePage> }
export type Milestone = { title: string; done: boolean }

export type Client = Row & {
  phone: string; message: string; services: string[]; createdAt: string
  notes: { _id: string; text: string; at: string }[]
  projects: ProjectRow[]
  /** the AI writer is set up on the server */
  ai: boolean
  license: License; licenseState: LicenseState
  invoices: Invoice[]; docs: DocRow[]
}

export type Summary = { due: number; openValue: number; openCount: number; unpaidValue: number; unpaidCount: number; receivedThisMonth: number; inbox: number }

export type Template = { kind: string; title: string; hint: string; body: string }
