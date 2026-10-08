import { useEffect, useState } from 'react'

/** Current time in India, ticking every second. */
export function useClock() {
  const [t, setT] = useState('')
  useEffect(() => {
    const tick = () => setT(new Date().toLocaleTimeString('en-GB', { timeZone: 'Asia/Kolkata' }))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])
  return t
}
