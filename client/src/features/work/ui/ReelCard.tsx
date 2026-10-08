import type { Project } from '../../../shared/types/content'
import { joinParts, pad } from '../../../shared/lib/format'
import { MediaPreview } from './MediaPreview'
import { RollText } from './RollText'

type Props = { p: Project; n: number; src: string; dup?: boolean }

export function ReelCard({ p, n, src, dup }: Props) {
  return (
    <a className="rcard" href={`/work/${p.slug}`} data-cursor="View" tabIndex={dup ? -1 : undefined}>
      <MediaPreview p={p} src={src} />
      <div className="wcard-info">
        <h3><RollText text={p.name} /></h3>
        <span className="mono">{pad(n)} / {joinParts([p.kind, p.year])}</span>
      </div>
    </a>
  )
}
