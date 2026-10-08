import type { Project } from '../../../../shared/types/content'
import { ik } from '../../../../shared/lib/media'

export function NextProject({ next }: { next: Project | null }) {
  if (!next) return null
  return (
    <a href={`/work/${next.slug}`} className="pj-next" data-cursor="Next">
      <span className="mono">Next project</span>
      <h2 className="mega">{next.name}</h2>
      {next.cover && <div className="pj-next-img"><img src={ik(next.cover, 'w-1600')} alt="" /></div>}
    </a>
  )
}
