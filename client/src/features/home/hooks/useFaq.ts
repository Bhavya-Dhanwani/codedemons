import { useState } from 'react'

/** Accordion: one answer open at a time, the first one to start with. */
export function useFaq() {
  const [open, setOpen] = useState<number | null>(0)
  return {
    isOpen: (i: number) => open === i,
    toggle: (i: number) => setOpen(open === i ? null : i),
  }
}
