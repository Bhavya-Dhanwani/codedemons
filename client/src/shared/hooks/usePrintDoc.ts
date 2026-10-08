import { useEffect, useState } from 'react'
import type { DocFull } from '../types/content'

/** "Download PDF" = the browser's print dialog, titled after the document. `printing` mounts the printable copy. */
export function usePrintDoc(doc: DocFull) {
  const [printing, setPrinting] = useState(false)
  useEffect(() => {
    if (!printing) return
    const title = document.title
    document.title = `${doc.title} - ${doc.clientInfo?.company || doc.clientInfo?.name || 'codedemons'}`
    const done = () => { document.title = title; setPrinting(false) }
    addEventListener('afterprint', done)
    requestAnimationFrame(() => print())
    return () => removeEventListener('afterprint', done)
  }, [printing, doc])
  return { printing, print: () => setPrinting(true) }
}
