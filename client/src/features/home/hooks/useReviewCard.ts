import { useRef, useState } from 'react'
import type { Review } from '../../../shared/types/content'
import { ik, ikPoster } from '../../../shared/lib/media'

/** Click to play / pause a review video. */
export function useReviewCard(r: Review) {
  const video = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(false)
  const toggle = () => {
    if (!r.video) return
    if (video.current!.paused) { video.current!.play(); setPlaying(true) } else { video.current!.pause(); setPlaying(false) }
  }
  return {
    video, playing, toggle,
    ended: () => setPlaying(false),
    cursor: r.video ? (playing ? 'Pause' : 'Play') : undefined,
    src: ik(r.video, 'w-1280'),
    poster: ik(r.poster, 'w-1000') || ikPoster(r.video, 1000) || undefined,
  }
}
