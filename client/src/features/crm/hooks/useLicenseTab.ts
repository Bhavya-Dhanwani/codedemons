import { useState, type ChangeEvent } from 'react'
import { useToast } from '../../../shared/hooks/useToast'
import { day, isoDay } from '../../../shared/lib/format'
import { LICENSE_STATE } from '../constants'
import { fromClassic, withDefaults } from '../lib/canvas'
import type { Canvas, Client, MaintenancePage } from '../types'
import type { ClientActions } from './useClientActions'

const PAGE_DEFAULTS: MaintenancePage = { heading: '', logo: '', bg: '#f2f1ed', fg: '#0d0d12', accent: '#2b3bff', buttonLabel: '', buttonUrl: '', canvas: null }

/** Website license: on/off switch, install snippet, paid-until and grace settings, the maintenance page design. */
export function useLicenseTab(c: Client, a: ClientActions) {
  const toast = useToast()
  const l = c.license
  const savedPage = { ...PAGE_DEFAULTS, ...l.page }
  const [d, setD] = useState({ domain: l.domain, paidUntil: isoDay(l.paidUntil), graceDays: String(l.graceDays), message: l.message })
  const [designing, setDesigning] = useState(false)
  const dirty = d.domain !== l.domain || d.paidUntil !== isoDay(l.paidUntil) || Number(d.graceDays) !== l.graceDays || d.message !== l.message
  // pages designed before the canvas open as the same layout, ready to move around
  const canvas: Canvas = withDefaults(savedPage.canvas ?? fromClassic(savedPage, l.message))
  const logo = savedPage.logo || canvas.els.find((e) => e.t === 'image' && e.src)?.src || ''
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
    design: {
      canvas, logo, message: l.message,
      custom: !!savedPage.canvas,
      open: designing,
      start: () => setDesigning(true),
      stop: () => setDesigning(false),
      save: (next: Canvas) => a.patch({ license: { page: { ...savedPage, canvas: next } } }, 'Maintenance page saved'),
    },
    dirty,
    canSave: dirty,
    save: () => a.patch({ license: { ...d, paidUntil: d.paidUntil || null, graceDays: Number(d.graceDays) } }),
    replaceKey: () => a.makeLicense('New key made, update the snippet on their site'),
  }
}

export type LicenseTabModel = ReturnType<typeof useLicenseTab>
