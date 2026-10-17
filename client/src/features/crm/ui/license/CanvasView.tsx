import type { HTMLAttributes, Ref } from 'react'
import { backOf, styleOf } from '../../lib/canvas'
import type { Canvas, CanvasEl } from '../../types'

type ElProps = HTMLAttributes<HTMLElement> & { e: CanvasEl; placeholder?: boolean; ref?: Ref<HTMLDivElement> }

/** One element, drawn with the same rules as the live page. */
export function ElView({ e, placeholder, className = '', ...rest }: ElProps) {
  const cls = `cv-e cv-${e.t} ${className}`
  if (e.t === 'image') {
    if (e.src) return <img {...(rest as HTMLAttributes<HTMLImageElement>)} className={cls} style={styleOf(e)} src={e.src} alt="" draggable={false} />
    return placeholder ? <div {...rest} className={cls + ' empty'} style={styleOf(e)}><span>Image: upload in the panel</span></div> : null
  }
  if (e.t === 'box') return <div {...rest} className={cls} style={styleOf(e)} />
  if (e.t === 'button' && e.src) return <div {...rest} className={cls} style={styleOf(e)}><img src={e.src} alt="" draggable={false} className="cv-icon" />{e.text && <span>{e.text}</span>}</div>
  return <div {...rest} className={cls} style={styleOf(e)}>{e.text}</div>
}

/** The whole page, read only: thumbnails and template previews. */
export function CanvasView({ c, stageRef }: { c: Canvas; stageRef?: Ref<HTMLDivElement> }) {
  return (
    <div className="cv-stage" style={backOf(c)} ref={stageRef} aria-hidden>
      {c.els.map((e, i) => <ElView key={i} e={e} />)}
    </div>
  )
}
