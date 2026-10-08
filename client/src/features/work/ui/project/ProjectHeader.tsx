import type { Project } from '../../../../shared/types/content'
import { Reveal } from '../../../../shared/components/motion/Reveal'

type Props = { p: Project; position: string; meta: string[][] }

export function ProjectHeader({ p, position, meta }: Props) {
  return (
    <header className="pj-head">
      <a href="/work" className="mono pj-back">All work</a>
      <span className="mono">{position}</span>
      <Reveal as="h1" text={p.name} className="mega" />
      {p.intro && <p className="pj-intro">{p.intro}</p>}
      <div className="pj-meta">
        {meta.map(([k, v]) => <div key={k}><span className="mono">{k}</span><p>{v}</p></div>)}
        {p.liveUrl && <div><span className="mono">Live</span><p><a href={p.liveUrl} target="_blank" rel="noopener noreferrer" className="u">Visit site</a></p></div>}
      </div>
    </header>
  )
}
