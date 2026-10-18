import { useCallback, useEffect, useRef, useState, type PointerEvent as RPointerEvent } from 'react'
import { useToast } from '../../../shared/hooks/useToast'
import { H, LINK, PH, PRESETS, PW, W, applyTheme, clean, inView, newEl, phoneBox, phoneLayout, withDefaults, type Theme } from '../lib/canvas'
import type { Canvas, CanvasEl } from '../types'

type Hist = { past: Canvas[]; c: Canvas; future: Canvas[] }
type Guides = { x?: number; y?: number }
type Geo = Pick<CanvasEl, 'x' | 'y' | 'w' | 'h' | 'size'>
export type Handle = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w'
export const HANDLES: Handle[] = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w']

const typing = (t: EventTarget | null) => t instanceof HTMLElement && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))

/** Snap a moving box to the stage edges / centre and to the other elements, within `thr` stage px. */
function snap(x: number, y: number, w: number, h: number, others: Geo[], thr: number, sw: number, sh: number) {
  const g: Guides = {}
  const fit = (pos: number, size: number, targets: number[], axis: 'x' | 'y') => {
    let best = thr, out = pos
    for (const t of targets) for (const edge of [0, size / 2, size]) {
      const d = Math.abs(pos + edge - t)
      if (d < best) { best = d; out = t - edge; g[axis] = t }
    }
    return out
  }
  const tx = [0, sw / 2, sw, ...others.flatMap((o) => [o.x, o.x + o.w / 2, o.x + o.w])]
  const ty = [0, sh / 2, sh, ...others.flatMap((o) => [o.y, o.y + o.h / 2, o.y + o.h])]
  return { x: fit(x, w, tx, 'x'), y: fit(y, h, ty, 'y'), guides: g }
}

/**
 * The maintenance page canvas: add, drag (with snapping), resize, type on elements, style them,
 * undo / redo, keyboard shortcuts, save. Desktop and phone are two layouts of the same elements:
 * position and size are per layout, text and styles are shared.
 */
export function useCanvasDesigner(initial: Canvas, logo: string, onSave: (c: Canvas) => Promise<boolean>, onClose: () => void) {
  const toast = useToast()
  const [h, setH] = useState<Hist>({ past: [], c: initial, future: [] })
  const [sel, setSel] = useState<number | null>(null)
  const [editing, setEditing] = useState<number | null>(null)
  const [guides, setGuides] = useState<Guides>({})
  const [view, setViewState] = useState<'desktop' | 'phone'>('desktop')
  const [saved, setSaved] = useState(() => JSON.stringify(initial))
  const [saving, setSaving] = useState(false)
  const stage = useRef<HTMLDivElement>(null)
  const c = h.c
  const phone = view === 'phone'
  const [SW, SH] = phone ? [PW, PH] : [W, H]

  const commit = useCallback((next: Canvas) => setH((x) => ({ past: [...x.past.slice(-80), x.c], c: next, future: [] })), [])
  const live = (fn: (c: Canvas) => Canvas) => setH((x) => ({ ...x, c: fn(x.c) }))
  const begin = () => setH((x) => ({ past: [...x.past.slice(-80), x.c], c: x.c, future: [] }))
  const undo = useCallback(() => setH((x) => (x.past.length ? { past: x.past.slice(0, -1), c: x.past[x.past.length - 1], future: [x.c, ...x.future] } : x)), [])
  const redo = useCallback(() => setH((x) => (x.future.length ? { past: [...x.past, x.c], c: x.future[0], future: x.future.slice(1) } : x)), [])
  const setEls = (els: CanvasEl[]) => commit({ ...c, els })
  const patch = (i: number, p: Partial<CanvasEl>) => setEls(c.els.map((e, j) => (j === i ? { ...e, ...p } : e)))

  // position / size in the layout on screen
  const at = (e: CanvasEl): Geo => inView(e, phone)
  const withGeo = (e: CanvasEl, p: Partial<Geo>): CanvasEl => (phone ? { ...e, m: { ...(e.m ?? phoneBox(e)), ...p } } : { ...e, ...p })
  const geo = (i: number, p: Partial<Geo>) => setEls(c.els.map((e, j) => (j === i ? withGeo(e, p) : e)))
  const shown = (e: CanvasEl) => !(phone && e.m?.hide)

  // typing on the canvas commits on blur; blur first so a click elsewhere never drops the text
  const commitTyping = () => { if (document.activeElement instanceof HTMLElement && document.activeElement.isContentEditable) document.activeElement.blur() }
  const scale = () => (stage.current?.getBoundingClientRect().width ?? SW) / SW

  // drag to move; a click without movement just selects
  const startMove = (i: number, ev: RPointerEvent) => {
    if (editing === i || ev.button !== 0) return
    ev.stopPropagation()
    commitTyping()
    setSel(i); setEditing(null)
    const k = scale(), sx = ev.clientX, sy = ev.clientY, from = at(c.els[i]), others = c.els.filter((e, j) => j !== i && shown(e)).map(at)
    let moved = false
    const move = (e: PointerEvent) => {
      const dx = (e.clientX - sx) / k, dy = (e.clientY - sy) / k
      if (!moved && Math.hypot(e.clientX - sx, e.clientY - sy) < 3) return
      if (!moved) { begin(); moved = true }
      const s = e.altKey ? { x: from.x + dx, y: from.y + dy, guides: {} } : snap(from.x + dx, from.y + dy, from.w, from.h, others, 6 / k, SW, SH)
      live((x) => ({ ...x, els: x.els.map((el, j) => (j === i ? withGeo(el, { x: s.x, y: s.y }) : el)) }))
      setGuides(s.guides)
    }
    const up = () => { removeEventListener('pointermove', move); setGuides({}) }
    addEventListener('pointermove', move)
    addEventListener('pointerup', up, { once: true })
  }

  const startResize = (i: number, dir: Handle, ev: RPointerEvent) => {
    ev.stopPropagation(); ev.preventDefault()
    begin()
    const k = scale(), sx = ev.clientX, sy = ev.clientY, f = at(c.els[i]), image = c.els[i].t === 'image'
    const move = (e: PointerEvent) => {
      const dx = (e.clientX - sx) / k, dy = (e.clientY - sy) / k
      let { x, y, w, h: hh } = f
      if (dir.includes('e')) w = f.w + dx
      if (dir.includes('w')) { w = f.w - dx; x = f.x + dx }
      if (dir.includes('s')) hh = f.h + dy
      if (dir.includes('n')) { hh = f.h - dy; y = f.y + dy }
      // corners keep the proportions for images, or for anything with Shift held
      if (dir.length === 2 && (e.shiftKey || image)) { hh = w * (f.h / f.w); if (dir.includes('n')) y = f.y + f.h - hh }
      if (w < 8) { if (dir.includes('w')) x = f.x + f.w - 8; w = 8 }
      if (hh < 8) { if (dir.includes('n')) y = f.y + f.h - 8; hh = 8 }
      live((cv) => ({ ...cv, els: cv.els.map((el, j) => (j === i ? withGeo(el, { x, y, w, h: hh }) : el)) }))
    }
    addEventListener('pointermove', move)
    addEventListener('pointerup', () => removeEventListener('pointermove', move), { once: true })
  }

  const remove = (i: number) => { setEls(c.els.filter((_, j) => j !== i)); setSel(null); setEditing(null) }
  const duplicate = (i: number) => {
    const e = c.els[i], g = at(e)
    setEls([...c.els, withGeo(e, { x: g.x + 24, y: g.y + 24 })]); setSel(c.els.length)
  }
  const layer = (i: number, to: 'front' | 'back' | 'up' | 'down') => {
    const els = [...c.els]
    const [e] = els.splice(i, 1)
    const at = to === 'front' ? els.length : to === 'back' ? 0 : Math.max(0, Math.min(els.length, i + (to === 'up' ? 1 : -1)))
    els.splice(at, 0, e)
    setEls(els); setSel(at)
  }

  // the phone layout starts as one centred column the first time you open it
  const setView = (v: 'desktop' | 'phone') => {
    commitTyping(); setEditing(null)
    if (v === 'phone' && !c.mobile) commit(phoneLayout(c))
    setViewState(v)
  }

  const dirty = JSON.stringify(c) !== saved
  const badLinks = c.els.some((e) => e.t === 'button' && e.href.trim() && !LINK.test(e.href.trim()))
  const save = useCallback(async () => {
    if (badLinks) { toast('Fix the button link first'); return }
    setSaving(true)
    const next = clean(c)
    if (await onSave(next)) setSaved(JSON.stringify(c))
    setSaving(false)
  }, [badLinks, c, onSave, toast])

  // keyboard: delete, nudge, undo / redo, duplicate, save, escape (never reaching the drawer underneath)
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey
      if (e.key === 'Escape') {
        e.stopPropagation()
        if (editing !== null) setEditing(null); else if (sel !== null) setSel(null); else if (!dirty) onClose()
        return
      }
      if (mod && e.key.toLowerCase() === 's') { e.preventDefault(); save(); return }
      if (typing(e.target)) return
      if (mod && e.key.toLowerCase() === 'z') { e.preventDefault(); if (e.shiftKey) redo(); else undo(); return }
      if (mod && e.key.toLowerCase() === 'y') { e.preventDefault(); redo(); return }
      if (sel === null) return
      if (mod && e.key.toLowerCase() === 'd') { e.preventDefault(); duplicate(sel); return }
      if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); remove(sel); return }
      if (e.key === 'Enter' && c.els[sel]?.t !== 'image' && c.els[sel]?.t !== 'box') { e.preventDefault(); setEditing(sel); return }
      const step = e.shiftKey ? 10 : 1
      const d = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }[e.key]
      if (d) { e.preventDefault(); const g = at(c.els[sel]); geo(sel, { x: g.x + d[0], y: g.y + d[1] }) }
    }
    addEventListener('keydown', key, true)
    return () => removeEventListener('keydown', key, true)
  })

  const selected = sel !== null ? c.els[sel] : null
  return {
    c, stage, sel, editing, guides, view, setView, phone, SW, SH,
    selected,
    /** position and size of the selection in the layout on screen */
    selGeo: selected ? at(selected) : null,
    select: (i: number | null) => { if (i !== editing) commitTyping(); setSel(i); if (i !== editing) setEditing(null) },
    startMove, startResize,
    startEditing: (i: number) => { if (c.els[i].t !== 'image' && c.els[i].t !== 'box') { setSel(i); setEditing(i) } },
    finishEditing: (i: number, text: string) => { setEditing(null); if (text !== c.els[i].text) patch(i, { text }) },
    add: (kind: Parameters<typeof newEl>[0]) => {
      const e = newEl(kind, c)
      setEls([...c.els, c.mobile ? { ...e, m: phoneBox(e) } : e]); setSel(c.els.length)
    },
    patch, geo, remove, duplicate, layer,
    hideOnPhone: (i: number, hide: boolean) => setEls(c.els.map((e, j) => (j === i ? { ...e, m: { ...(e.m ?? phoneBox(e)), hide } } : e))),
    resetPhone: () => { commit(phoneLayout(c)); setSel(null) },
    page: (p: Partial<Canvas>) => commit({ ...c, ...p }),
    theme: (t: Theme) => commit(applyTheme(c, t)),
    presets: PRESETS.map((p) => ({ name: p.name, canvas: withDefaults(p.make(logo)), use: () => { commit(withDefaults(p.make(logo))); setSel(null); setViewState('desktop') } })),
    undo, redo, canUndo: h.past.length > 0, canRedo: h.future.length > 0,
    dirty, saving, badLinks, save,
  }
}

export type Designer = ReturnType<typeof useCanvasDesigner>
