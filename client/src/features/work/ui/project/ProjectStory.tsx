import type { Project } from '../../../../shared/types/content'

export function ProjectStory({ p }: { p: Project }) {
  if (!p.challenge && !p.solution) return null
  return (
    <section className="pj-story">
      {p.challenge && <div><span className="mono label">The challenge</span><p>{p.challenge}</p></div>}
      {p.solution && <div><span className="mono label">What we did</span><p>{p.solution}</p></div>}
    </section>
  )
}
