import { useEffect } from 'react'

export function useEscape(onEscape: () => void) {
  useEffect(() => {
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && onEscape()
    addEventListener('keydown', esc)
    return () => removeEventListener('keydown', esc)
  }, [onEscape])
}
