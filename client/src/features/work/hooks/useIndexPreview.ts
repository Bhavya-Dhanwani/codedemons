import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'

/** List view: a preview image chases the cursor and shows the hovered row's cover. */
export function useIndexPreview() {
  const prev = useRef<HTMLDivElement>(null)
  const [cur, setCur] = useState<number | null>(null)
  useEffect(() => {
    const x = gsap.quickTo(prev.current, 'x', { duration: 0.6, ease: 'power3' })
    const y = gsap.quickTo(prev.current, 'y', { duration: 0.6, ease: 'power3' })
    const move = (e: PointerEvent) => { x(e.clientX); y(e.clientY) }
    addEventListener('pointermove', move)
    return () => removeEventListener('pointermove', move)
  }, [])
  useEffect(() => { gsap.to(prev.current, { scale: cur === null ? 0 : 1, duration: 0.5, ease: 'expo.out' }) }, [cur])
  return { prev, setCur, offset: `translateY(${-(cur ?? 0) * 100}%)` }
}
