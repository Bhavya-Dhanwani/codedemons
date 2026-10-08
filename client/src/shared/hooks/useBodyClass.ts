import { useEffect } from 'react'

export function useBodyClass(cls: string) {
  useEffect(() => {
    document.body.classList.add(cls)
    return () => document.body.classList.remove(cls)
  }, [cls])
}
