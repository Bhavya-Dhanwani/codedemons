import type { Project } from '../../../../shared/types/content'
import { ik } from '../../../../shared/lib/media'

export function ProjectGallery({ p }: { p: Project }) {
  if (!p.gallery.length) return null
  return (
    <div className="pj-gallery">
      {p.gallery.map((src, k) => <div className="parallax" key={k}><img src={ik(src, 'w-1800')} alt={`${p.name} gallery ${k + 1}`} loading="lazy" /></div>)}
    </div>
  )
}
