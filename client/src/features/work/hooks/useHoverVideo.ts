import { useRef } from 'react'

/** Plays a muted preview video while the pointer is over its card. */
export function useHoverVideo() {
  const video = useRef<HTMLVideoElement>(null)
  return {
    video,
    onPointerEnter: () => { video.current?.play().catch(() => {}) },
    onPointerLeave: () => video.current?.pause(),
  }
}
