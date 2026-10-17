import { useLayoutEffect, useMemo, useRef, type ClipboardEvent } from 'react'
import type { DocFull, Sig } from '../../types/content'
import { fromDom, parseDoc, toHtml } from '../../lib/markdown'
import { when } from '../../lib/format'
import { Logo } from '../brand/Logo'

function DocBody({ text }: { text: string }) {
  const blocks = useMemo(() => parseDoc(text), [text])
  return blocks.map((b, i) => {
    if (b.type === 'ul') return <ul key={i}>{b.items.map((l, k) => <li key={k}>{l}</li>)}</ul>
    const Tag = b.type
    return <Tag key={i}>{b.text}</Tag>
  })
}

/**
 * The body, typed into right on the paper. React never re-renders the children while you type:
 * the HTML is only replaced when the text changes from outside (AI writer, markdown view, a reload).
 */
function EditableBody({ text, onChange }: { text: string; onChange: (md: string) => void }) {
  const ref = useRef<HTMLDivElement>(null)
  const shown = useRef<string | null>(null)
  useLayoutEffect(() => {
    if (ref.current && text !== shown.current) { ref.current.innerHTML = toHtml(text); shown.current = text }
  }, [text])
  const emit = () => { const md = fromDom(ref.current!); shown.current = md; onChange(md) }
  // plain text only, so pasted styles and scripts never reach the document
  const paste = (e: ClipboardEvent) => { e.preventDefault(); document.execCommand('insertText', false, e.clipboardData.getData('text/plain')) }
  return (
    <div ref={ref} className="doc-body editable" contentEditable suppressContentEditableWarning spellCheck
      onInput={emit} onPaste={paste} onFocus={() => document.execCommand('defaultParagraphSeparator', false, 'p')}
      role="textbox" aria-multiline aria-label="Document text" />
  )
}

function SigBox({ who, party, s }: { who: string; party: string; s?: Sig }) {
  return (
    <div className="doc-sig">
      <span className="mono">{who}</span>
      <div className="doc-sig-img">{s?.image ? <img src={s.image} alt={`Signature of ${s.name}`} /> : <i>Awaiting signature</i>}</div>
      <b>{s?.name || party}</b>
      <small>{s?.at ? `Signed ${when(s.at)}` : 'Not signed yet'}</small>
    </div>
  )
}

/** The document as it looks on paper. Also what gets printed / saved as PDF. With `onBody` you can type on it. */
export function Paper({ doc, onBody }: { doc: DocFull; onBody?: (md: string) => void }) {
  const c = doc.clientInfo
  return (
    <article className="doc-paper">
      <header className="doc-head"><Logo /><span className="mono">{doc.status === 'signed' ? 'Signed' : doc.kind || 'Document'}</span></header>
      {onBody ? <EditableBody text={doc.body} onChange={onBody} /> : <DocBody text={doc.body} />}
      <footer className="doc-sigs">
        <SigBox who="For codedemons" party="codedemons" s={doc.us} />
        <SigBox who={`For ${c?.company || c?.name || 'the client'}`} party={c?.name || 'Client'} s={doc.them} />
      </footer>
    </article>
  )
}
