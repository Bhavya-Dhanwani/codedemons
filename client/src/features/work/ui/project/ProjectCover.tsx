import type { Project } from '../../../../shared/types/content'
import { ik, ikPoster } from '../../../../shared/lib/media'

/** Hero video, or the cover image when there's no video. */
export function ProjectCover({ p }: { p: Project }) {
  if (!p.video && !p.cover) return null
  return (
    <div className="pj-cover parallax" style={{ background: p.tint }}>
      {p.video
        ? <video src={ik(p.video, 'w-1920,ac-none')} poster={ik(p.cover, 'w-2000') || ikPoster(p.video, 2000) || undefined} autoPlay muted loop playsInline />
        : <img src={ik(p.cover, 'w-2400')} alt={`${p.name} website`} />}
    </div>
  )
}
