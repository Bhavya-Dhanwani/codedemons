import type { Project } from '../../../../shared/types/content'

export function ProjectResults({ p }: { p: Project }) {
  if (!p.results.length) return null
  return (
    <section className="pj-results">
      <span className="mono label">Results</span>
      <div className="pj-results-grid">
        {p.results.map((r) => <div className="pj-result" key={r.l}><b>{r.v}</b><span className="mono">{r.l}</span></div>)}
      </div>
    </section>
  )
}
