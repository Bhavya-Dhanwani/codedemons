import { createPortal } from 'react-dom'
import type { DocFull } from '../../types/content'
import { usePrintDoc } from '../../hooks/usePrintDoc'
import { Button } from '../Button'
import { Paper } from './Paper'

/** Download as PDF via the print dialog. The paper is portalled to <body> so drawers don't clip it. */
export function PdfButton({ doc }: { doc: DocFull }) {
  const { printing, print } = usePrintDoc(doc)
  return (
    <>
      <Button onClick={print}>Download PDF</Button>
      {printing && createPortal(<div className="print-only"><Paper doc={doc} /></div>, document.body)}
    </>
  )
}
