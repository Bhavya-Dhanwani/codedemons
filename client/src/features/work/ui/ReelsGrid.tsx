import type { Project } from '../../../shared/types/content'
import { ReelCard } from './ReelCard'

/** Two reels side by side; the second shows each project's detail shot, in reverse order. */
export function ReelsGrid({ list, filter }: { list: Project[]; filter: string }) {
  const reversed = [...list].reverse()
  return (
    // wrapper div keeps React's DOM intact when GSAP inserts the pin-spacer
    <div key={filter}>
      <div className="reels">
        <div className="reel reel-l">
          {list.map((p, i) => <ReelCard key={p._id} p={p} n={i + 1} src={p.cover} />)}
        </div>
        <div className="reel-rail" aria-hidden><i /></div>
        <div className="reel reel-r" aria-hidden>
          {reversed.map((p) => <ReelCard key={p._id} p={p} n={list.indexOf(p) + 1} src={p.detail || p.cover} dup />)}
        </div>
      </div>
    </div>
  )
}
