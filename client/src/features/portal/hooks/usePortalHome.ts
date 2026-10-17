import { day, firstName, label, plural } from '../../../shared/lib/format'
import type { Me, ProjectRow } from '../types'

const rowOf = (p: ProjectRow) => ({
  ...p,
  phaseText: label(p.phase),
  pct: p.total ? Math.round((p.done / p.total) * 100) : 0,
  progressText: p.total ? `${p.done} of ${p.total} milestones` : `Started ${day(p.createdAt, 'long')}`,
})

/** Portal home: greeting, what's waiting on them, their projects (none yet = start the first one). */
export function usePortalHome(me: Me) {
  const toSign = me.docs.filter((d) => d.status === 'sent').length
  const toPay = me.invoices.filter((i) => i.status === 'due').length
  const unread = me.projects.filter((p) => p.unread).length
  return {
    first: firstName(me.name),
    greeting: `Hi ${firstName(me.name)}`,
    empty: !me.projects.length,
    todo: {
      any: toSign > 0 || toPay > 0 || unread > 0,
      sign: toSign ? `Sign ${toSign} ${plural(toSign, 'document')}` : '',
      pay: toPay ? `Pay ${toPay} ${plural(toPay, 'invoice')}` : '',
      read: unread ? `${unread} ${plural(unread, 'new message')}` : '',
    },
    projects: me.projects.map(rowOf),
  }
}
