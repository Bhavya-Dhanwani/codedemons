import type { LicenseState } from './types'

export const STAGES = ['new', 'contacted', 'proposal', 'won', 'lost'] as const

/** The three ways to look at the list: [server view, label] */
export const VIEWS = [['due', 'To follow up'], ['inbox', 'Unread messages'], ['all', 'Everyone']] as const
/** Narrow to one stage of the pipeline */
export const STAGE_VIEWS = [['new', 'New leads'], ['contacted', 'Contacted'], ['proposal', 'Proposal sent'], ['won', 'Clients'], ['lost', 'Lost']] as const

export const CLIENT_TABS = ['Overview', 'Projects', 'Documents', 'Payments', 'Website'] as const
export type ClientTab = (typeof CLIENT_TABS)[number]

/** License status: [text, tone class] */
export const LICENSE_STATE: Record<LicenseState, [string, string]> = {
  none: ['No license', ''],
  active: ['Website is live', 'ok'],
  grace: ['Payment overdue, still live (grace period)', 'warn'],
  expired: ['Website is down: payment overdue', 'bad'],
  off: ['Website is switched off', 'bad'],
}

/** Invoice option: extend the license this many days when paid */
export const LICENSE_EXTEND = [['0', "Don't extend"], ['30', '1 month'], ['90', '3 months'], ['180', '6 months'], ['365', '1 year']] as const
