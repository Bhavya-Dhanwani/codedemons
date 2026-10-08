import { day, firstName, plural } from '../../../shared/lib/format'
import type { Me } from '../types'

/** Project overview: greeting, what's waiting on them, stage, milestones, updates. */
export function usePortalHome(me: Me) {
  const toSign = me.docs.filter((d) => d.status === 'sent').length
  const toPay = me.invoices.filter((i) => i.status === 'due').length
  const done = me.milestones.filter((m) => m.done).length
  return {
    greeting: `Hi ${firstName(me.name)}`,
    sub: `${me.company || 'Your project'} with codedemons`,
    todo: {
      any: toSign > 0 || toPay > 0,
      sign: toSign ? `Sign ${toSign} ${plural(toSign, 'document')}` : '',
      pay: toPay ? `Pay ${toPay} ${plural(toPay, 'invoice')}` : '',
    },
    progress: {
      text: `${done} of ${me.milestones.length} done`,
      pct: me.milestones.length ? Math.round((done / me.milestones.length) * 100) : 0,
    },
    updateTime: (at: string) => day(at, 'long'),
  }
}
