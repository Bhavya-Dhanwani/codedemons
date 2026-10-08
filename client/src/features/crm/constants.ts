import type { LicenseState } from './types'

export const STAGES = ['new', 'contacted', 'proposal', 'won', 'lost'] as const

/** List filters: [server view, chip label] */
export const VIEWS = [['due', 'Follow up'], ['new', 'New'], ['contacted', 'Contacted'], ['proposal', 'Proposal'], ['won', 'Clients'], ['lost', 'Lost'], ['all', 'All']] as const

export const CLIENT_TABS = ['Overview', 'Project', 'Documents', 'Payments', 'License'] as const
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
