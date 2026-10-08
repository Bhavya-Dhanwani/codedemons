import { useState, type ChangeEvent } from 'react'
import { useToast } from '../../../shared/hooks/useToast'
import { day, isoDay } from '../../../shared/lib/format'
import { LICENSE_STATE } from '../constants'
import type { Client, MaintenancePage } from '../types'
import type { ClientActions } from './useClientActions'

// Same defaults and colour rules as the license script (server/src/modules/public/license/license.router.ts),
// so the preview matches what visitors get.
const PAGE_DEFAULTS: MaintenancePage = { heading: '', logo: '', bg: '#f2f1ed', fg: '#0d0d12', accent: '#2b3bff', buttonLabel: '', buttonUrl: '' }
const DEFAULT_HEADING = 'Temporarily unavailable'
const DEFAULT_MESSAGE = 'This website is under maintenance. Please check back soon.'
const LINK = /^(https:\/\/[^\s"'<>]+|mailto:[^\s"'<>]+|tel:[\d+\s()-]+)$/
const ink = (h: string) => {
  const n = parseInt(h.slice(1), 16)
  return ((n >> 16) * 299 + ((n >> 8) & 255) * 587 + (n & 255) * 114) / 1000 < 150 ? '#fff' : '#0d0d12'
}

/** Website license: on/off switch, install snippet, paid-until and grace settings, the maintenance page design. */
export function useLicenseTab(c: Client, a: ClientActions) {
  const toast = useToast()
  const l = c.license
  const savedPage = { ...PAGE_DEFAULTS, ...l.page }
  const [d, setD] = useState({ domain: l.domain, paidUntil: isoDay(l.paidUntil), graceDays: String(l.graceDays), message: l.message })
  const [page, setPage] = useState<MaintenancePage>(savedPage)
  const pageDirty = (Object.keys(PAGE_DEFAULTS) as (keyof MaintenancePage)[]).some((k) => page[k] !== savedPage[k])
  const dirty = pageDirty || d.domain !== l.domain || d.paidUntil !== isoDay(l.paidUntil) || Number(d.graceDays) !== l.graceDays || d.message !== l.message
  const snippet = `<script src="${location.origin}/api/license/sdk.js" data-key="${l.key}"></script>`
  // fullstack apps: the guard runs on their server, before their app
  const serverSnippet = [
    `curl -o license-guard.mjs ${location.origin}/api/license/guard.mjs`,
    `curl -o license-guard.d.mts ${location.origin}/api/license/guard.d.mts   # TypeScript projects`,
    '',
    '// server entry, before every other route and static files:',
    'import { licenseGuard } from "./license-guard.mjs"',
    'app.use(licenseGuard({ key: process.env.CODEDEMONS_LICENSE }))',
    '',
    '// Next.js middleware / edge (Workers, Hono, Bun, Deno) instead:',
    '// const blocked = await guard.respond(request); if (blocked) return blocked',
    '',
    `# .env\nCODEDEMONS_LICENSE=${l.key}`,
  ].join('\n')
  const [text, tone] = LICENSE_STATE[c.licenseState]
  const goesDown = l.paidUntil && c.licenseState === 'grace' ? `, goes down ${day(new Date(new Date(l.paidUntil).getTime() + l.graceDays * 864e5).toISOString())}` : ''
  const linkBad = !!page.buttonUrl.trim() && !LINK.test(page.buttonUrl.trim())

  return {
    exists: !!l.key,
    create: () => a.makeLicense('License created'),
    on: l.on,
    toggle: () => a.patch({ license: { on: !l.on } }, l.on ? 'Website switched off' : 'Website switched on'),
    status: { text, tone, paid: l.paidUntil ? `Paid until ${day(l.paidUntil)}${goesDown}` : '' },
    snippet,
    serverSnippet,
    copy: (text: string) => navigator.clipboard.writeText(text).then(() => toast('Copied')),
    field: (k: keyof typeof d) => ({ value: d[k], onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setD({ ...d, [k]: e.target.value }) }),
    page,
    pageField: (k: keyof MaintenancePage) => ({ name: k, value: page[k], onChange: (e: ChangeEvent<HTMLInputElement>) => setPage({ ...page, [k]: e.target.value }) }),
    setLogo: (logo: string) => setPage({ ...page, logo }),
    linkError: linkBad ? 'Must start with https://, mailto: or tel:' : undefined,
    resetDesign: () => setPage({ ...PAGE_DEFAULTS, logo: page.logo }),
    preview: {
      heading: page.heading.trim() || DEFAULT_HEADING,
      message: d.message.trim() || DEFAULT_MESSAGE,
      logo: page.logo,
      page: { background: page.bg, color: page.fg },
      button: page.buttonLabel.trim() ? { label: page.buttonLabel.trim(), style: { background: page.accent, color: ink(page.accent) } } : null,
    },
    dirty,
    canSave: dirty && !linkBad,
    save: () => a.patch({
      license: {
        ...d, paidUntil: d.paidUntil || null, graceDays: Number(d.graceDays),
        page: { ...page, heading: page.heading.trim(), buttonLabel: page.buttonLabel.trim(), buttonUrl: page.buttonUrl.trim() },
      },
    }),
    replaceKey: () => a.makeLicense('New key made, update the snippet on their site'),
  }
}

export type LicenseTabModel = ReturnType<typeof useLicenseTab>
