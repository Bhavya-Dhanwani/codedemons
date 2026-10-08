import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { isTouch } from '../../../lib/media'

/** Dot cursor; grows over links and shows a label from the nearest [data-cursor]. */
export function useCursor() {
  const ref = useRef<HTMLDivElement>(null)
  const [label, setLabel] = useState('')
  useEffect(() => {
    if (isTouch()) return
    const x = gsap.quickTo(ref.current, 'x', { duration: 0.35, ease: 'power3' })
    const y = gsap.quickTo(ref.current, 'y', { duration: 0.35, ease: 'power3' })
    const root = document.documentElement
    const move = (e: PointerEvent) => {
      x(e.clientX); y(e.clientY)
      // shared pointer position, used by CSS eyes that follow the cursor
      root.style.setProperty('--mx', String((e.clientX / innerWidth) * 2 - 1))
      root.style.setProperty('--my', String((e.clientY / innerHeight) * 2 - 1))
      const t = e.target as HTMLElement
      const l = t.closest<HTMLElement>('[data-cursor]')?.dataset.cursor ?? ''
      setLabel(l)
      ref.current!.className = 'cursor' + (l === 'hidden' ? ' gone' : l ? ' label' : t.closest('a,button') ? ' big' : '')
    }
    addEventListener('pointermove', move)
    return () => removeEventListener('pointermove', move)
  }, [])
  return { ref, label: label === 'hidden' ? '' : label }
}
