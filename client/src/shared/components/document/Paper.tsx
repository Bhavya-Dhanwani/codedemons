import { useMemo } from 'react'
import type { DocFull, Sig } from '../../types/content'
import { parseDoc } from '../../lib/markdown'
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

/** The document as it looks on paper. Also what gets printed / saved as PDF. */
export function Paper({ doc }: { doc: DocFull }) {
  const c = doc.clientInfo
  return (
    <article className="doc-paper">
      <header className="doc-head"><Logo /><span className="mono">{doc.status === 'signed' ? 'Signed' : doc.kind || 'Document'}</span></header>
      <DocBody text={doc.body} />
      <footer className="doc-sigs">
        <SigBox who="For codedemons" party="codedemons" s={doc.us} />
        <SigBox who={`For ${c?.company || c?.name || 'the client'}`} party={c?.name || 'Client'} s={doc.them} />
      </footer>
    </article>
  )
}
