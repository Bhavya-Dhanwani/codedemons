import { Link } from 'react-router'
import { buttonClass } from '../../../shared/components/Button'
import { ErrorText } from '../../../shared/components/Feedback'
import { Paper } from '../../../shared/components/document/Paper'
import { PdfButton } from '../../../shared/components/document/PdfButton'
import { SignPad } from '../../../shared/components/document/SignPad'
import { usePortalDoc } from '../hooks/usePortalDoc'

/** /portal/documents/:id */
export default function DocumentPage() {
  const d = usePortalDoc()
  if (!d.doc) return <ErrorText>{d.error}</ErrorText>
  return (
    <>
      <div className="ad-row spread">
        <Link to="/portal/documents" className={buttonClass({ variant: 'ghost' })}>All documents</Link>
        <PdfButton doc={d.doc} />
      </div>
      <div className="doc-frame"><Paper doc={d.doc} /></div>
      {d.doc.status === 'sent' && (
        <div className="pt-card">
          <span className="mono">Sign here</span>
          <SignPad busy={d.signing} onSign={d.sign} />
          <ErrorText>{d.error}</ErrorText>
        </div>
      )}
      {d.doc.status === 'signed' && <p className="pt-ok">Signed, thank you. Download a copy for your records anytime.</p>}
    </>
  )
}
