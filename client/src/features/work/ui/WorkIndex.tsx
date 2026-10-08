import type { Project } from '../../../shared/types/content'
import { ik } from '../../../shared/lib/media'
import { pad } from '../../../shared/lib/format'
import { useIndexPreview } from '../hooks/useIndexPreview'

/** Index list; a preview image chases the cursor. */
export function WorkIndex({ list }: { list: Project[] }) {
  const { prev, setCur, offset } = useIndexPreview()
  return (
    <div className="index" onPointerLeave={() => setCur(null)}>
      <ul className="index-list">
        {list.map((p, i) => (
          <li key={p._id} onPointerMove={() => setCur(i)}>
            <a href={`/work/${p.slug}`} data-cursor="View">
              <span className="mono">{pad(i + 1)}</span>
              <h3>{p.name}</h3>
              <span className="mono">{p.kind}</span>
              <span className="mono">{p.year}</span>
            </a>
          </li>
        ))}
      </ul>
      <div className="index-prev" ref={prev} aria-hidden>
        <div className="index-strip" style={{ transform: offset }}>
          {list.map((p) => <div key={p._id} style={{ background: p.tint }}>{p.cover && <img src={ik(p.cover, 'w-700')} alt="" />}</div>)}
        </div>
      </div>
    </div>
  )
}
