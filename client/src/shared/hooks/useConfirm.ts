import { useEffect, useRef, useState } from 'react'

/** Click once to arm, again within 3s to run. For destructive buttons. */
export function useConfirm(run: () => void) {
  const [armed, setArmed] = useState(false)
  const timer = useRef(0)
  useEffect(() => () => clearTimeout(timer.current), [])
  const click = () => {
    clearTimeout(timer.current)
    if (armed) { setArmed(false); run(); return }
    setArmed(true)
    timer.current = window.setTimeout(() => setArmed(false), 3000)
  }
  return { armed, click }
}
