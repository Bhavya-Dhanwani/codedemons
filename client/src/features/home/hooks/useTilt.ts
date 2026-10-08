import { useRef, type MouseEvent } from 'react'
import gsap from 'gsap'

/** Card tilts toward the cursor in 3D and springs back on leave. */
export function useTilt<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const onMouseMove = (e: MouseEvent) => {
    const r = ref.current!.getBoundingClientRect()
    gsap.to(ref.current, { rotateY: ((e.clientX - r.left) / r.width - 0.5) * 12, rotateX: -((e.clientY - r.top) / r.height - 0.5) * 12, duration: 0.5 })
  }
  const onMouseLeave = () => gsap.to(ref.current, { rotateX: 0, rotateY: 0, duration: 0.8, ease: 'elastic.out(1,0.4)' })
  return { ref, onMouseMove, onMouseLeave }
}
