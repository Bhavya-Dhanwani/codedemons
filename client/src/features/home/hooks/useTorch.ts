import { useEffect, useRef } from 'react'
import gsap from 'gsap'

const IDLE_MS = 3000 // mouse still this long: the torch goes back to wandering on its own

/** Dark room; the cursor is a torch. Peepers near the light hide. */
export function useTorch() {
  const ref = useRef<HTMLElement>(null)
  useEffect(() => {
    const el = ref.current!
    let hover = false, lastMove = 0, tx = 0.5, ty = 0.5, cx = 0.5, cy = 0.5
    const set = (px: number, py: number) => {
      el.style.setProperty('--x', px * 100 + '%')
      el.style.setProperty('--y', py * 100 + '%')
      el.querySelectorAll<HTMLElement>('.peeper').forEach((p) => {
        const dx = parseFloat(p.style.left) / 100 - px, dy = parseFloat(p.style.top) / 100 - py
        p.classList.toggle('shy', Math.hypot(dx * 1.6, dy) < 0.16)
      })
    }
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      hover = true; lastMove = performance.now()
      tx = (e.clientX - r.left) / r.width; ty = (e.clientY - r.top) / r.height
    }
    const leave = () => (hover = false)
    // the torch follows the mouse; when nobody holds it (pointer away, or still for IDLE_MS) it wanders on its own.
    // It always eases toward its target, so handing over between the two glides instead of jumping.
    const tick = (t: number, dt: number) => {
      const idle = !hover || performance.now() - lastMove > IDLE_MS
      if (idle) { tx = 0.5 + Math.sin(t * 0.6) * 0.32; ty = 0.5 + Math.sin(t * 1.1) * 0.22 }
      // tight follow while the mouse holds it, a slower glide when handing over to the wander path
      const k = 1 - Math.exp(-dt / (idle ? 400 : 50))
      cx += (tx - cx) * k; cy += (ty - cy) * k
      set(cx, cy)
    }
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerleave', leave)
    gsap.ticker.add(tick)
    return () => { el.removeEventListener('pointermove', move); el.removeEventListener('pointerleave', leave); gsap.ticker.remove(tick) }
  }, [])
  return ref
}
