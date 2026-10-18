import type { HTMLAttributes, Ref } from 'react'
import { backOf, inView, styleOf } from '../../lib/canvas'
import type { Canvas, CanvasEl } from '../../types'

type ElProps = HTMLAttributes<HTMLElement> & { e: CanvasEl; placeholder?: boolean; phone?: boolean; ref?: Ref<HTMLDivElement> }

/** One element, drawn with the same rules as the live page. */
export function ElView({ e: raw, placeholder, phone = false, className = '', ...rest }: ElProps) {
  const e = inView(raw, phone)
  const st = styleOf(e, phone)
  const cls = `cv-e cv-${e.t} ${className}${phone && raw.m?.hide ? ' off-phone' : ''}`
  if (e.t === 'image') {
    if (e.src) return <img {...(rest as HTMLAttributes<HTMLImageElement>)} className={cls} style={st} src={e.src} alt="" draggable={false} />
    return placeholder ? <div {...rest} className={cls + ' empty'} style={st}><span>Image: upload in the panel</span></div> : null
  }
  if (e.t === 'box') return <div {...rest} className={cls} style={st} />
  if (e.t === 'button' && e.src) return <div {...rest} className={cls} style={st}><img src={e.src} alt="" draggable={false} className="cv-icon" />{e.text && <span>{e.text}</span>}</div>
  return <div {...rest} className={cls} style={st}>{e.text}</div>
}

/** The whole page, read only: thumbnails and template previews. */
export function CanvasView({ c, stageRef }: { c: Canvas; stageRef?: Ref<HTMLDivElement> }) {
  return (
    <div className="cv-stage" style={backOf(c)} ref={stageRef} aria-hidden>
      {c.els.map((e, i) => <ElView key={i} e={e} />)}
    </div>
  )
}
