import { useRef, useState, type PointerEvent } from 'react'
import type { Signature } from '../types/content'

/** Draw-and-type signature on a 600x180 canvas; `sign` hands back a PNG data URL. */
export function useSignPad(onSign: (s: Signature) => void) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const drawing = useRef(false)
  const [drawn, setDrawn] = useState(false)
  const [name, setName] = useState('')
  const [agree, setAgree] = useState(false)

  const pos = (e: PointerEvent) => {
    const r = canvas.current!.getBoundingClientRect()
    return [(e.clientX - r.left) * (canvas.current!.width / r.width), (e.clientY - r.top) * (canvas.current!.height / r.height)] as const
  }
  const onPointerDown = (e: PointerEvent) => {
    const ctx = canvas.current!.getContext('2d')!
    ctx.lineWidth = 2.5; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = '#0d0d12'
    ctx.beginPath(); ctx.moveTo(...pos(e))
    drawing.current = true
    canvas.current!.setPointerCapture(e.pointerId)
  }
  const onPointerMove = (e: PointerEvent) => {
    if (!drawing.current) return
    const ctx = canvas.current!.getContext('2d')!
    ctx.lineTo(...pos(e)); ctx.stroke()
    setDrawn(true)
  }
  const onPointerUp = () => { drawing.current = false }
  const clear = () => { canvas.current!.getContext('2d')!.clearRect(0, 0, 600, 180); setDrawn(false) }
  const sign = () => onSign({ name: name.trim(), image: canvas.current!.toDataURL('image/png') })

  return {
    canvas, pad: { onPointerDown, onPointerMove, onPointerUp },
    drawn, clear, name, setName, agree, setAgree, sign,
    ready: drawn && name.trim().length > 1 && agree,
  }
}
