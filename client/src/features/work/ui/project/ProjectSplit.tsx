import type { Project } from '../../../../shared/types/content'
import { ik } from '../../../../shared/lib/media'

/** Tint block with the name next to the detail shot. */
export function ProjectSplit({ p, tagline, tintText }: { p: Project; tagline: string; tintText: string }) {
  const img = p.detail || p.cover
  return (
    <div className="pj-split">
      <div className="pj-tint" style={{ background: p.tint, color: tintText }}>
        <em>{p.name}</em>
        <span className="mono">{tagline}</span>
      </div>
      {img && <div className="parallax"><img src={ik(img, 'w-1800')} alt={`${p.name} detail`} loading="lazy" /></div>}
    </div>
  )
}
