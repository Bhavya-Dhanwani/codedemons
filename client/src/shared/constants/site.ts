export const EMAIL = 'hello@codedemons.in'

/** Project phases, shared by the CRM (sets them) and the client portal (shows them). */
export const PHASES = ['planning', 'design', 'build', 'review', 'live'] as const
export type Phase = (typeof PHASES)[number]
