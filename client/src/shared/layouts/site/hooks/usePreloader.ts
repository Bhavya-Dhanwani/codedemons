import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { preloadDone } from '../../../state/uiSlice'
import { useAppDispatch } from '../../../hooks/store'

/** 000 to 100 counter and bar, then the screen wipes away. */
export function usePreloader() {
  const ref = useRef<HTMLDivElement>(null)
  const dispatch = useAppDispatch()
  useGSAP(() => {
    const o = { v: 0 }
    gsap.timeline({ onComplete: () => dispatch(preloadDone()) })
      .to(o, { v: 100, duration: 1.6, ease: 'power2.inOut', onUpdate: () => { ref.current!.querySelector('.pl-num')!.textContent = String(Math.round(o.v)).padStart(3, '0') } })
      .to('.pl-bar i', { scaleX: 1, duration: 1.6, ease: 'power2.inOut' }, 0)
      .to(ref.current, { clipPath: 'inset(0 0 100% 0)', duration: 1, ease: 'expo.inOut' }, '+=0.1')
  }, { scope: ref })
  return ref
}
