import type { CSSProperties } from 'react'
import type { Canvas, CanvasEl, MaintenancePage } from '../types'

// The maintenance page is a 1280x720 stage. Positions are stored in stage pixels and drawn with % and
// container query units, exactly like server/src/modules/public/license/license.page.ts, so what you
// design here is what visitors get at any screen size. Keep the two in step.
export const W = 1280
export const H = 720
export const FONTS: Record<CanvasEl['font'], string> = {
  sans: "system-ui,-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif",
  serif: "Georgia,'Times New Roman',serif",
  mono: 'ui-monospace,Menlo,Consolas,monospace',
  round: "ui-rounded,'SF Pro Rounded',Nunito,system-ui,sans-serif",
}
export const LINK = /^(https:\/\/[^\s"'<>]+|mailto:[^\s"'<>]+|tel:[\d+\s()-]+)$/
const DEFAULT_HEADING = 'Temporarily unavailable'
const DEFAULT_MESSAGE = 'This website is under maintenance. Please check back soon.'

export const ink = (h: string) => {
  const n = parseInt(h.slice(1), 16)
  return ((n >> 16) * 299 + ((n >> 8) & 255) * 587 + (n & 255) * 114) / 1000 < 150 ? '#ffffff' : '#0d0d12'
}

const BASE: CanvasEl = {
  t: 'text', x: 0, y: 0, w: 200, h: 60, text: '', src: '', href: '', size: 24, weight: 400, italic: false,
  font: 'sans', align: 'left', color: '#0d0d12', fill: '', radius: 0, opacity: 1, spacing: 0, lh: 1.2,
  fill2: '', fangle: 135, clip: false, bw: 0, bc: '#0d0d12', shadow: 0, rot: 0, upper: false, underline: false, fit: 'contain',
}
export const el = (e: Partial<CanvasEl>): CanvasEl => ({ ...BASE, ...e })
/** Saved designs from before a field existed get its default. */
export const withDefaults = (c: Canvas): Canvas => ({ bg3: '', bgType: 'linear', ...c, els: c.els.map(el) })

/** A new element of a kind, centred on the stage (nudged so several don't stack exactly). */
export function newEl(kind: 'heading' | 'text' | 'button' | 'image' | 'box', c: Canvas): CanvasEl {
  const fg = ink(c.bg)
  const shift = (c.els.length % 6) * 16
  const at = (w: number, h: number) => ({ x: Math.round((W - w) / 2) + shift, y: Math.round((H - h) / 2) + shift, w, h })
  switch (kind) {
    case 'heading': return el({ ...at(760, 90), text: 'Your heading', size: 60, weight: 600, align: 'center', color: fg, spacing: -0.03, lh: 1.05 })
    case 'text': return el({ ...at(620, 70), text: 'Write something here.', size: 22, align: 'center', color: fg, opacity: 0.75, lh: 1.5 })
    case 'button': return el({ t: 'button', ...at(220, 60), text: 'Contact us', size: 18, weight: 500, align: 'center', fill: '#2b3bff', color: '#ffffff', radius: 30 })
    case 'image': return el({ t: 'image', ...at(240, 120) })
    case 'box': return el({ t: 'box', ...at(320, 200), fill: '#2b3bff', radius: 20, opacity: 0.9 })
  }
}

/** The page as designed before the canvas existed (same layout the server draws for old pages). */
export function fromClassic(p: Partial<MaintenancePage>, message: string): Canvas {
  const fg = p.fg || '#0d0d12'
  const ac = p.accent || '#2b3bff'
  const els: CanvasEl[] = []
  if (p.logo) els.push(el({ t: 'image', x: 540, y: 150, w: 200, h: 80, src: p.logo }))
  els.push(el({ x: 190, y: 250, w: 900, h: 90, text: p.heading || DEFAULT_HEADING, size: 60, weight: 500, align: 'center', color: fg, spacing: -0.03, lh: 1.1 }))
  els.push(el({ x: 290, y: 355, w: 700, h: 70, text: message || DEFAULT_MESSAGE, size: 21, align: 'center', color: fg, opacity: 0.7, lh: 1.5 }))
  if (p.buttonLabel && LINK.test(p.buttonUrl || '')) els.push(el({ t: 'button', x: 520, y: 460, w: 240, h: 60, text: p.buttonLabel, href: p.buttonUrl, size: 18, weight: 500, align: 'center', fill: ac, color: ink(ac), radius: 30 }))
  return { bg: p.bg || '#f2f1ed', bg2: '', angle: 135, img: '', dim: 0, els }
}

/** Starting points; every one is fully editable. */
export const PRESETS: { name: string; make: (logo: string) => Canvas }[] = [
  { name: 'Centred', make: (logo) => fromClassic({ logo }, '') },
  {
    name: 'Bold',
    make: (logo) => ({
      bg: '#0b0b10', bg2: '#2b3bff', angle: 135, img: '', dim: 0,
      els: [
        el({ t: 'box', x: 860, y: 90, w: 340, h: 340, fill: '#ffffff', radius: 170, opacity: 0.07 }),
        ...(logo ? [el({ t: 'image', x: 96, y: 96, w: 180, h: 60, src: logo })] : []),
        el({ x: 96, y: 210, w: 820, h: 220, text: "We'll be right back.", size: 104, weight: 600, color: '#ffffff', spacing: -0.04, lh: 1 }),
        el({ x: 96, y: 450, w: 620, h: 70, text: "We're making a few improvements. Thanks for your patience.", size: 22, color: '#ffffff', opacity: 0.75, lh: 1.5 }),
        el({ t: 'button', x: 96, y: 560, w: 220, h: 60, text: 'Email us', size: 18, weight: 500, align: 'center', fill: '#ffffff', color: '#0b0b10', radius: 30 }),
      ],
    }),
  },
  {
    name: 'Card',
    make: (logo) => ({
      bg: '#e9e8e2', bg2: '', angle: 135, img: '', dim: 0,
      els: [
        el({ t: 'box', x: 290, y: 120, w: 700, h: 480, fill: '#ffffff', radius: 32 }),
        ...(logo ? [el({ t: 'image', x: 560, y: 160, w: 160, h: 56, src: logo })] : []),
        el({ x: 340, y: 236, w: 600, h: 30, text: 'SCHEDULED MAINTENANCE', size: 13, weight: 500, font: 'mono', align: 'center', color: '#6e6d73', spacing: 0.2 }),
        el({ x: 340, y: 276, w: 600, h: 120, text: 'Back online shortly', size: 52, weight: 500, font: 'serif', italic: true, align: 'center', color: '#0d0d12', lh: 1.05 }),
        el({ x: 370, y: 400, w: 540, h: 60, text: 'Our site is getting an upgrade. Please check back in a little while.', size: 19, align: 'center', color: '#0d0d12', opacity: 0.7, lh: 1.5 }),
        el({ t: 'button', x: 530, y: 490, w: 220, h: 56, text: 'Contact us', size: 17, weight: 500, align: 'center', fill: '#2b3bff', color: '#ffffff', radius: 28 }),
      ],
    }),
  },
  {
    name: 'Minimal',
    make: (logo) => ({
      bg: '#ffffff', bg2: '', angle: 135, img: '', dim: 0,
      els: [
        ...(logo ? [el({ t: 'image', x: 80, y: 64, w: 140, h: 48, src: logo })] : []),
        el({ x: 80, y: 520, w: 1120, h: 140, text: 'Under maintenance', size: 120, weight: 500, color: '#0d0d12', spacing: -0.05, lh: 1 }),
        el({ x: 860, y: 72, w: 340, h: 60, text: 'Back soon. Thank you for waiting.', size: 18, align: 'right', color: '#6e6d73', lh: 1.4 }),
        el({ t: 'box', x: 80, y: 500, w: 1120, h: 2, fill: '#0d0d12' }),
      ],
    }),
  },
]

const paint = (a: string, b: string, angle: number) => (a && b ? `linear-gradient(${angle}deg, ${a}, ${b})` : a)

/** Page background: colour, linear / radial gradient of 2 or 3 colours, optional photo with a dark wash. */
export function backOf(c: Canvas): CSSProperties {
  const stops = [c.bg, c.bg2, c.bg2 && c.bg3].filter(Boolean).join(', ')
  let back = !c.bg2 ? c.bg : c.bgType === 'radial' ? `radial-gradient(circle at center, ${stops})` : `linear-gradient(${c.angle}deg, ${stops})`
  if (c.img) { const d = `rgba(0,0,0,${c.dim})`; back = `linear-gradient(${d}, ${d}), url("${c.img}") center/cover no-repeat, ${back}` }
  return { background: back }
}

export const box = (e: Pick<CanvasEl, 'x' | 'y' | 'w' | 'h'>): CSSProperties => ({ left: `${e.x / 12.8}%`, top: `${e.y / 7.2}%`, width: `${e.w / 12.8}%`, height: `${e.h / 7.2}%` })

/** Inline style of one element, the same rules the server uses. */
export function styleOf(e: CanvasEl): CSSProperties {
  const s: CSSProperties & Record<string, string | number> = { ...box(e), opacity: e.opacity, '--fs': e.size, '--r': e.radius }
  if (e.bw) s.border = `calc(${e.bw} * var(--u)) solid ${e.bc}`
  if (e.shadow) s.boxShadow = `0 calc(${Math.round(e.shadow * 30)} * var(--u)) calc(${Math.round(e.shadow * 80)} * var(--u)) rgba(0,0,0,${(e.shadow * 0.55).toFixed(2)})`
  if (e.rot) s.transform = `rotate(${e.rot}deg)`
  const fill = paint(e.fill, e.fill2, e.fangle)
  if (e.t === 'box') return { ...s, background: fill || '#0d0d12' }
  if (e.t === 'image') return { ...s, objectFit: e.fit }
  const clip = e.t === 'text' && e.clip && !!fill
  return {
    ...s, color: clip ? 'transparent' : e.color, fontFamily: FONTS[e.font], fontWeight: e.weight, fontStyle: e.italic ? 'italic' : 'normal',
    letterSpacing: `${e.spacing}em`, lineHeight: e.lh, textAlign: e.align, background: fill || undefined,
    textTransform: e.upper ? 'uppercase' : undefined, textDecoration: e.underline ? 'underline' : undefined,
    ...(clip ? { WebkitBackgroundClip: 'text', backgroundClip: 'text' } : {}),
    justifyContent: e.t === 'button' ? (e.align === 'left' ? 'flex-start' : e.align === 'right' ? 'flex-end' : 'center') : undefined,
  }
}

/** One look for the whole page: background, text colour, accent for buttons, font. */
export type Theme = { name: string; bg: string; bg2: string; fg: string; accent: string; font: CanvasEl['font'] }
export const THEMES: Theme[] = [
  { name: 'Paper', bg: '#f2f1ed', bg2: '', fg: '#0d0d12', accent: '#2b3bff', font: 'sans' },
  { name: 'Night', bg: '#0b0b10', bg2: '#1c1c2e', fg: '#f2f1ed', accent: '#7c83ff', font: 'sans' },
  { name: 'Ocean', bg: '#0f4c81', bg2: '#00b4d8', fg: '#ffffff', accent: '#ffd166', font: 'round' },
  { name: 'Sunset', bg: '#ff7e5f', bg2: '#feb47b', fg: '#2d1b12', accent: '#2d1b12', font: 'serif' },
  { name: 'Forest', bg: '#14281d', bg2: '#355834', fg: '#e9f5db', accent: '#b5e48c', font: 'serif' },
  { name: 'Mono', bg: '#ffffff', bg2: '', fg: '#111111', accent: '#111111', font: 'mono' },
]

/** Recolour everything to a theme; images and shapes keep their own look. */
export const applyTheme = (c: Canvas, t: Theme): Canvas => ({
  ...c, bg: t.bg, bg2: t.bg2, bg3: '',
  els: c.els.map((e) => (e.t === 'text' ? { ...e, color: t.fg, font: t.font, clip: false }
    : e.t === 'button' ? { ...e, fill: t.accent, fill2: '', color: ink(t.accent), bc: t.accent, font: t.font } : e)),
})

/** Whole numbers for positions, nothing the server would refuse. */
export const clean = (c: Canvas): Canvas => ({
  ...c, els: c.els.map((e) => ({ ...e, x: Math.round(e.x), y: Math.round(e.y), w: Math.max(4, Math.round(e.w)), h: Math.max(4, Math.round(e.h)), text: e.text.slice(0, 600) })),
})
