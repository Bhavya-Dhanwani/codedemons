import { useEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Button } from '../../../../shared/components/Button'
import { ConfirmButton } from '../../../../shared/components/ConfirmButton'
import { MediaInput } from '../../../admin/ui/MediaInput'
import { IMG } from '../../../admin/config/resources'
import { HANDLES, useCanvasDesigner, type Designer } from '../../hooks/useCanvasDesigner'
import { FONTS, LINK, THEMES, backOf, box, ink, type Theme } from '../../lib/canvas'
import type { Canvas, CanvasEl } from '../../types'
import { CanvasView, ElView } from './CanvasView'

const ADD = [['heading', 'Heading', 'H'], ['text', 'Text', '¶'], ['button', 'Button', '◉'], ['image', 'Image', '▣'], ['box', 'Shape', '■']] as const
const WEIGHTS = [300, 400, 500, 600, 700, 800]

function Row({ label, children }: { label: string; children: ReactNode }) {
  return <label className="cv-row"><span>{label}</span>{children}</label>
}

function Color({ value, onChange, none }: { value: string; onChange: (v: string) => void; none?: string }) {
  return (
    <span className="cv-color">
      <input type="color" value={value || '#ffffff'} onChange={(e) => onChange(e.target.value)} />
      <input value={value} placeholder={none} maxLength={7} onChange={(e) => /^#?[0-9a-f]{0,6}$/i.test(e.target.value) && onChange(e.target.value.startsWith('#') ? e.target.value : '#' + e.target.value)} />
      {none && value && <button type="button" onClick={() => onChange('')} title={`No ${none}`}>×</button>}
    </span>
  )
}

function Num({ value, onChange, min, max, step = 1 }: { value: number; onChange: (v: number) => void; min: number; max: number; step?: number }) {
  return <input type="number" value={Math.round(value / step) * step} min={min} max={max} step={step} onChange={(e) => e.target.value !== '' && onChange(Math.min(max, Math.max(min, Number(e.target.value))))} />
}

function Slider({ value, onChange, min, max, step }: { value: number; onChange: (v: number) => void; min: number; max: number; step: number }) {
  return <span className="cv-slider"><input type="range" value={value} min={min} max={max} step={step} onChange={(e) => onChange(Number(e.target.value))} /><b>{+value.toFixed(2)}</b></span>
}

/** Typing straight onto the canvas: the text is set once, read back on blur. */
function InlineText({ e, onDone }: { e: CanvasEl; onDone: (text: string) => void }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const n = ref.current!
    n.textContent = e.text
    n.focus()
    getSelection()?.selectAllChildren(n)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <ElView e={{ ...e, text: '', src: '' }} className="editing" ref={ref} contentEditable suppressContentEditableWarning
      onBlur={() => onDone((ref.current?.innerText ?? '').replace(/\n$/, ''))}
      onPaste={(x) => { x.preventDefault(); document.execCommand('insertText', false, x.clipboardData.getData('text/plain')) }}
      onPointerDown={(x) => x.stopPropagation()} />
  )
}

function Inspector({ d }: { d: Designer }) {
  const i = d.sel!
  const e = d.selected!
  const set = (p: Partial<CanvasEl>) => d.patch(i, p)
  const typed = e.t === 'text' || e.t === 'button'
  const linkBad = !!e.href.trim() && !LINK.test(e.href.trim())
  return (
    <>
      <div className="cv-head"><b>{{ text: 'Text', button: 'Button', image: 'Image', box: 'Shape' }[e.t]}</b><Button variant="ghost" size="sq" onClick={() => d.select(null)} aria-label="Deselect">×</Button></div>
      {typed && <textarea className="cv-textarea" rows={3} value={e.text} maxLength={600} onChange={(x) => set({ text: x.target.value })} />}
      {e.t === 'button' && (
        <Row label="Link">
          <input value={e.href} placeholder="mailto:hello@site.com" onChange={(x) => set({ href: x.target.value })} aria-invalid={linkBad} />
        </Row>
      )}
      {linkBad && <small className="field-err">Start with https://, mailto: or tel:</small>}
      {e.t === 'image' && (
        <>
          <MediaInput value={e.src} accept={IMG} onChange={(src) => set({ src })} />
          <div className="cv-row"><span>Fit</span><Seg value={e.fit} options={[['contain', 'Whole image'], ['cover', 'Fill box']]} onPick={(fit) => set({ fit })} /></div>
        </>
      )}
      {e.t === 'button' && (
        <>
          <span className="mono cv-sec">Icon or image in the button</span>
          <MediaInput value={e.src} accept={IMG} onChange={(src) => set({ src })} />
        </>
      )}

      {typed && (
        <>
          <span className="mono cv-sec">Type</span>
          <Row label="Font">
            <select value={e.font} onChange={(x) => set({ font: x.target.value as CanvasEl['font'] })}>
              {Object.keys(FONTS).map((f) => <option key={f} value={f}>{{ sans: 'Sans', serif: 'Serif', mono: 'Mono', round: 'Rounded' }[f]}</option>)}
            </select>
          </Row>
          <Row label="Size"><Num value={e.size} min={8} max={240} onChange={(size) => set({ size })} /></Row>
          <Row label="Weight">
            <select value={e.weight} onChange={(x) => set({ weight: Number(x.target.value) })}>{WEIGHTS.map((w) => <option key={w} value={w}>{w}</option>)}</select>
          </Row>
          <div className="cv-row">
            <span>Style</span>
            <div className="seg small">
              {(['left', 'center', 'right'] as const).map((a) => <button key={a} className={e.align === a ? 'on' : ''} onClick={() => set({ align: a })} aria-label={`Align ${a}`}>{{ left: '⇤', center: '↔', right: '⇥' }[a]}</button>)}
              <button className={e.italic ? 'on' : ''} onClick={() => set({ italic: !e.italic })} aria-label="Italic"><i>I</i></button>
              <button className={e.underline ? 'on' : ''} onClick={() => set({ underline: !e.underline })} aria-label="Underline"><u>U</u></button>
              <button className={e.upper ? 'on' : ''} onClick={() => set({ upper: !e.upper })} aria-label="Capitals">AA</button>
            </div>
          </div>
          <Row label="Colour"><Color value={e.color} onChange={(color) => set({ color })} /></Row>
          <Row label="Spacing"><Slider value={e.spacing} min={-0.1} max={0.5} step={0.01} onChange={(spacing) => set({ spacing })} /></Row>
          <Row label="Line height"><Slider value={e.lh} min={0.8} max={2.4} step={0.05} onChange={(lh) => set({ lh })} /></Row>
        </>
      )}

      <span className="mono cv-sec">Look</span>
      {e.t !== 'image' && (
        <>
          <Row label={e.t === 'text' ? 'Highlight' : 'Fill'}><Color value={e.fill} onChange={(fill) => set({ fill })} none={e.t === 'text' ? 'highlight' : undefined} /></Row>
          {e.fill && <Row label="Gradient to"><Color value={e.fill2} onChange={(fill2) => set({ fill2 })} none="gradient" /></Row>}
          {e.fill && e.fill2 && <Row label="Angle"><Slider value={e.fangle} min={0} max={360} step={5} onChange={(fangle) => set({ fangle })} /></Row>}
          {e.t === 'text' && e.fill && <label className="cv-check"><input type="checkbox" checked={e.clip} onChange={(x) => set({ clip: x.target.checked })} /> Paint it into the letters (gradient text)</label>}
        </>
      )}
      <Row label="Border"><Num value={e.bw} min={0} max={40} onChange={(bw) => set({ bw })} /></Row>
      {e.bw > 0 && <Row label="Border colour"><Color value={e.bc} onChange={(bc) => set({ bc })} /></Row>}
      <Row label="Shadow"><Slider value={e.shadow} min={0} max={1} step={0.05} onChange={(shadow) => set({ shadow })} /></Row>
      <Row label="Rotate"><Slider value={e.rot} min={-180} max={180} step={1} onChange={(rot) => set({ rot })} /></Row>
      <Row label="Corners"><Num value={e.radius} min={0} max={720} onChange={(radius) => set({ radius })} /></Row>
      <Row label="Opacity"><Slider value={e.opacity} min={0} max={1} step={0.05} onChange={(opacity) => set({ opacity })} /></Row>

      <span className="mono cv-sec">Position</span>
      <div className="cv-xywh">
        {(['x', 'y', 'w', 'h'] as const).map((k) => <label key={k}><span>{k.toUpperCase()}</span><Num value={e[k]} min={k === 'x' ? -1280 : k === 'y' ? -720 : 8} max={2560} onChange={(v) => set({ [k]: v })} /></label>)}
      </div>
      <div className="cv-btns">
        <Button onClick={() => d.patch(i, { x: (1280 - e.w) / 2 })}>Centre ↔</Button>
        <Button onClick={() => d.patch(i, { y: (720 - e.h) / 2 })}>Centre ↕</Button>
        <Button onClick={() => d.layer(i, 'front')}>To front</Button>
        <Button onClick={() => d.layer(i, 'back')}>To back</Button>
        <Button onClick={() => d.duplicate(i)}>Duplicate</Button>
        <Button variant="danger" onClick={() => d.remove(i)}>Delete</Button>
      </div>
    </>
  )
}

function Seg<T extends string>({ value, options, onPick }: { value: T; options: [T, string][]; onPick: (v: T) => void }) {
  return <div className="seg small">{options.map(([v, l]) => <button key={v} className={value === v ? 'on' : ''} onClick={() => onPick(v)}>{l}</button>)}</div>
}

const FONT_NAMES: Record<string, string> = { sans: 'Sans', serif: 'Serif', mono: 'Mono', round: 'Rounded' }

/** Ready themes, or your own: recolours the page, all text and all buttons in one go. */
function ThemePicker({ d }: { d: Designer }) {
  const c = d.c
  const firstText = c.els.find((e) => e.t === 'text')
  const firstBtn = c.els.find((e) => e.t === 'button')
  const [t, setT] = useState<Theme>({ name: 'Custom', bg: c.bg, bg2: c.bg2, fg: firstText?.color ?? ink(c.bg), accent: firstBtn?.fill || '#2b3bff', font: firstText?.font ?? 'sans' })
  return (
    <>
      <span className="mono cv-sec">Theme</span>
      <div className="cv-themes">
        {THEMES.map((x) => (
          <button key={x.name} type="button" onClick={() => { d.theme(x); setT(x) }} title={`Apply ${x.name}`}>
            <i style={{ background: x.bg2 ? `linear-gradient(135deg, ${x.bg}, ${x.bg2})` : x.bg }}><b style={{ background: x.accent }} /><em style={{ color: x.fg, fontFamily: FONTS[x.font] }}>Aa</em></i>
            {x.name}
          </button>
        ))}
      </div>
      <details className="cv-custom">
        <summary>Make your own theme</summary>
        <Row label="Background"><Color value={t.bg} onChange={(bg) => setT({ ...t, bg })} /></Row>
        <Row label="Gradient to"><Color value={t.bg2} onChange={(bg2) => setT({ ...t, bg2 })} none="gradient" /></Row>
        <Row label="Text"><Color value={t.fg} onChange={(fg) => setT({ ...t, fg })} /></Row>
        <Row label="Buttons"><Color value={t.accent} onChange={(accent) => setT({ ...t, accent })} /></Row>
        <Row label="Font">
          <select value={t.font} onChange={(x) => setT({ ...t, font: x.target.value as Theme['font'] })}>
            {Object.keys(FONTS).map((f) => <option key={f} value={f}>{FONT_NAMES[f]}</option>)}
          </select>
        </Row>
        <Button variant="primary" onClick={() => d.theme(t)}>Apply to everything</Button>
      </details>
    </>
  )
}

function PagePanel({ d }: { d: Designer }) {
  const c = d.c
  return (
    <>
      <div className="cv-head"><b>Page</b></div>
      <p className="crm-hint">Click anything on the canvas to style it. Double-click text to type.</p>
      <ThemePicker d={d} />
      <span className="mono cv-sec">Background</span>
      <Row label="Colour"><Color value={c.bg} onChange={(bg) => d.page({ bg })} /></Row>
      <Row label="Gradient to"><Color value={c.bg2} onChange={(bg2) => d.page({ bg2 })} none="gradient" /></Row>
      {c.bg2 && (
        <>
          <Row label="Then to"><Color value={c.bg3 ?? ''} onChange={(bg3) => d.page({ bg3 })} none="third colour" /></Row>
          <div className="cv-row"><span>Shape</span><Seg value={c.bgType ?? 'linear'} options={[['linear', 'Linear'], ['radial', 'Radial']]} onPick={(bgType) => d.page({ bgType })} /></div>
          {c.bgType !== 'radial' && <Row label="Angle"><Slider value={c.angle} min={0} max={360} step={5} onChange={(angle) => d.page({ angle })} /></Row>}
        </>
      )}
      <span className="mono cv-sec">Background photo</span>
      <MediaInput value={c.img} accept={IMG} onChange={(img) => d.page({ img })} />
      {c.img && <Row label="Darken"><Slider value={c.dim} min={0} max={0.9} step={0.05} onChange={(dim) => d.page({ dim })} /></Row>}
    </>
  )
}

function Stage({ d }: { d: Designer }) {
  const c = d.c
  return (
    <div className="cv-stage edit" ref={d.stage} style={backOf(c)} onPointerDown={() => d.select(null)}>
      {c.els.map((e, i) => (d.editing === i
        ? <InlineText key={i} e={e} onDone={(t) => d.finishEditing(i, t)} />
        : <ElView key={i} e={e} placeholder className={d.sel === i ? 'on' : ''} onPointerDown={(x) => d.startMove(i, x)} onDoubleClick={() => d.startEditing(i)} />))}
      {d.selected && d.editing === null && (
        <div className="cv-sel" style={{ ...box(d.selected), transform: d.selected.rot ? `rotate(${d.selected.rot}deg)` : undefined }}>
          {HANDLES.map((h) => <i key={h} className={'h-' + h} onPointerDown={(x) => d.startResize(d.sel!, h, x)} />)}
        </div>
      )}
      {d.guides.x !== undefined && <div className="cv-guide v" style={{ left: `${d.guides.x / 12.8}%` }} />}
      {d.guides.y !== undefined && <div className="cv-guide hz" style={{ top: `${d.guides.y / 7.2}%` }} />}
    </div>
  )
}
type Props = { initial: Canvas; message: string; logo: string; onSave: (c: Canvas) => Promise<boolean>; onClose: () => void }

/** Full screen designer for the page visitors see while a client's site is down. */
export function CanvasDesigner({ initial, message, logo, onSave, onClose }: Props) {
  const d = useCanvasDesigner(initial, message, logo, onSave, onClose)
  useEffect(() => { document.body.classList.add('de-open'); return () => document.body.classList.remove('de-open') }, [])
  return createPortal(
    <div className="de cv" role="dialog" aria-label="Maintenance page designer">
      <header className="de-top">
        {d.dirty ? <ConfirmButton onConfirm={onClose} confirm="Discard changes?">Close</ConfirmButton> : <Button variant="ghost" onClick={onClose}>← License</Button>}
        <b className="cv-title">Maintenance page</b>
        <div className="seg small">
          <button className={d.view === 'desktop' ? 'on' : ''} onClick={() => d.setView('desktop')}>Desktop</button>
          <button className={d.view === 'phone' ? 'on' : ''} onClick={() => d.setView('phone')}>Phone</button>
        </div>
        <div className="ad-row">
          <Button variant="ghost" size="sq" disabled={!d.canUndo} onClick={d.undo} aria-label="Undo" title="Undo (Ctrl+Z)">↶</Button>
          <Button variant="ghost" size="sq" disabled={!d.canRedo} onClick={d.redo} aria-label="Redo" title="Redo (Ctrl+Shift+Z)">↷</Button>
        </div>
        <span className="de-save mono">{d.saving ? 'Saving' : d.dirty ? 'Unsaved changes' : 'Saved'}</span>
        <div className="de-actions"><Button variant="primary" disabled={!d.dirty || d.saving || d.badLinks} onClick={d.save}>Save</Button></div>
      </header>

      <div className="cv-main">
        <aside className="cv-left">
          <span className="mono cv-sec">Add</span>
          <div className="cv-add">
            {ADD.map(([k, l, icon]) => <button key={k} type="button" onClick={() => d.add(k)}><b>{icon}</b>{l}</button>)}
          </div>
          <span className="mono cv-sec">Templates</span>
          <div className="cv-presets">
            {d.presets.map((p) => (
              <ConfirmButton key={p.name} className="cv-preset" onConfirm={p.use} confirm="Replace the design?">
                <CanvasView c={p.canvas} /><span>{p.name}</span>
              </ConfirmButton>
            ))}
          </div>
          <span className="mono cv-sec">Layers</span>
          <ol className="cv-layers">
            {d.c.els.map((e, i) => ({ e, i })).reverse().map(({ e, i }) => (
              <li key={i}><button type="button" className={d.sel === i ? 'on' : ''} onClick={() => d.select(i)}>
                <em>{{ text: '¶', button: '◉', image: '▣', box: '■' }[e.t]}</em><span>{e.t === 'image' ? 'Image' : e.t === 'box' ? 'Shape' : e.text || 'Empty'}</span>
              </button></li>
            ))}
          </ol>
        </aside>

        <div className="cv-center">
          {d.view === 'desktop'
            ? <div className="cv-fit"><Stage d={d} /></div>
            : <div className="cv-phone"><iframe title="Phone preview" sandbox="" srcDoc={d.phoneHtml} /></div>}
          <p className="cv-tip mono">{d.view === 'desktop' ? 'Drag to move · handles resize (Shift keeps shape) · double-click to type · arrows nudge · Alt turns off snapping' : 'On tall phone screens the page becomes one centred column, top to bottom. Shapes are hidden.'}</p>
        </div>

        <aside className="cv-right">{d.selected ? <Inspector d={d} /> : <PagePanel d={d} />}</aside>
      </div>
    </div>,
    document.body,
  )
}
