import { Button } from '../../../../shared/components/Button'
import { ConfirmButton } from '../../../../shared/components/ConfirmButton'
import { Field } from '../../../../shared/components/Field'
import { Paper } from '../../../../shared/components/document/Paper'
import { PdfButton } from '../../../../shared/components/document/PdfButton'
import { SignPad } from '../../../../shared/components/document/SignPad'
import type { ClientActions } from '../../hooks/useClientActions'
import { useDocEditor } from '../../hooks/useDocEditor'

export function DocEditor({ id, a, onBack }: { id: string; a: ClientActions; onBack: () => void }) {
  const e = useDocEditor(id, a, onBack)
  if (!e.doc || !e.shown) return null
  return (
    <>
      <div className="ad-row spread">
        <Button variant="ghost" onClick={onBack}>All documents</Button>
        {e.isDraft && (
          <div className="seg small">
            <button className={e.view === 'edit' ? 'on' : ''} onClick={() => e.setView('edit')}>Write</button>
            <button className={e.view === 'preview' ? 'on' : ''} onClick={() => e.setView('preview')}>Preview</button>
          </div>
        )}
      </div>

      {e.view === 'edit' ? (
        <>
          <Field label="Title"><input value={e.edit.title} onChange={(x) => e.setTitle(x.target.value)} /></Field>
          <Field label="Content" hint="# Title, ## Heading, - bullet point. Blank line starts a new paragraph.">
            <textarea className="doc-src" rows={22} value={e.edit.body} onChange={(x) => e.setBody(x.target.value)} />
          </Field>
        </>
      ) : <div className="doc-frame"><Paper doc={e.shown} /></div>}

      {e.signing && <div className="crm-callout"><SignPad label="Sign for codedemons" onSign={e.sign} /></div>}

      <div className="doc-actions">
        {e.isDraft && <Button disabled={!e.dirty} onClick={e.save}>Save draft</Button>}
        {e.canSign && <Button onClick={e.toggleSigning}>{e.signing ? 'Cancel signing' : 'Sign as codedemons'}</Button>}
        {e.isDraft && <Button variant="primary" disabled={e.dirty} title={e.dirty ? 'Save first' : ''} onClick={e.send}>Send to client</Button>}
        <PdfButton doc={e.shown} />
        {e.canDelete && <ConfirmButton onConfirm={e.remove}>Delete</ConfirmButton>}
      </div>
      {e.sent && <p className="crm-hint">Sent. They'll get a reminder every 3 days until they sign.</p>}
    </>
  )
}
