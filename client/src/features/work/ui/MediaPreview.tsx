import type { Project } from '../../../shared/types/content'
import { ik, ikPoster } from '../../../shared/lib/media'
import { useHoverVideo } from '../hooks/useHoverVideo'

/** Project image; plays the project video on hover when there is one. */
export function MediaPreview({ p, src }: { p: Project; src?: string }) {
  const { video, ...hover } = useHoverVideo()
  const img = ik(src || p.cover, 'w-1400') || ikPoster(p.video, 1400)
  return (
    <div className="media" style={{ background: p.tint }} {...hover}>
      {img && <img src={img} alt={`${p.name} preview`} loading="lazy" />}
      {p.video && <video ref={video} src={ik(p.video, 'w-1280,ac-none')} muted loop playsInline preload="none" />}
    </div>
  )
}
