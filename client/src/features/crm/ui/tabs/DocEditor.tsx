import { useEffect, type MouseEvent } from 'react'
import { createPortal } from 'react-dom'
import { Button } from '../../../../shared/components/Button'
import { ConfirmButton } from '../../../../shared/components/ConfirmButton'
import { Status } from '../../../../shared/components/Lists'
import { Paper } from '../../../../shared/components/document/Paper'
import { PdfButton } from '../../../../shared/components/document/PdfButton'
import { SignPad } from '../../../../shared/components/document/SignPad'
import { label } from '../../../../shared/lib/format'
import type { ClientActions } from '../../hooks/useClientActions'
import { QUICK_ASKS, useDocEditor, type DocEditorModel } from '../../hooks/useDocEditor'
import type { Client } from '../../types'

// formatting on the paper; mousedown keeps the text selection where it is
const FORMATS: [string, string, string?][] = [['Title', 'formatBlock', 'h2'], ['Heading', 'formatBlock', 'h3'], ['Text', 'formatBlock', 'p'], ['• List', 'insertUnorderedList']]
const format = (cmd: string, arg?: string) => (e: MouseEvent) => { e.preventDefault(); document.execCommand(cmd, false, arg) }

function AiPanel({ e }: { e: DocEditorModel }) {
  const ai = e.ai
  if (!e.isDraft) return null
  if (!ai.on) return (
    <div className="de-card">
      <span className="mono">AI writer</span>
      <p className="crm-hint">Turn it on by adding <code>MISTRAL_API_KEY</code> to <code>server/.env</code> and restarting the server.</p>
    </div>
  )
  return (
    <div className="de-card de-ai">
      <span className="mono">AI writer · Mistral</span>
      {ai.projects.length > 0 && (
        <label className="de-mini">Use the brief of
          <select value={ai.project} onChange={(x) => ai.setProject(x.target.value)}>
            <option value="">No project</option>
            {ai.projects.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
          </select>
        </label>
      )}
      <textarea rows={4} value={ai.ask} onChange={(x) => ai.setAsk(x.target.value)} disabled={ai.writing}
        placeholder={ai.hasText ? 'What should change? e.g. Add a clause about hosting costs' : 'What should it say? e.g. 6 page site, ₹80k, launch in 5 weeks'} />
      {ai.writing
        ? <Button onClick={ai.stop}><i className="de-pulse" /> Stop writing</Button>
        : (
          <div className="cp-row">
            <Button variant="primary" onClick={ai.write}>{ai.hasText ? 'Rewrite from scratch' : 'Write it'}</Button>
            {ai.hasText && <Button onClick={() => ai.revise()}>Edit this draft</Button>}
          </div>
        )}
      {ai.hasText && !ai.writing && (
        <div className="de-asks">{QUICK_ASKS.map((q) => <button key={q} type="button" onClick={() => ai.revise(q)}>{q}</button>)}</div>
      )}
      {ai.canUndo && <Button variant="ghost" onClick={ai.undo}>Undo AI changes</Button>}
      {ai.error && <p className="cp-err">{ai.error}</p>}
    </div>
  )
}

function Outline({ e }: { e: DocEditorModel }) {
  if (!e.outline.length) return null
  const go = (i: number) => document.querySelectorAll('.de-paper :is(h2, h3)')[i]?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  return (
    <div className="de-card">
      <span className="mono">Outline</span>
      <ol className="de-outline">
        {e.outline.map((o, i) => <li key={i} className={o.level}><button type="button" onClick={() => go(i)}>{o.text}</button></li>)}
      </ol>
    </div>
  )
}

/** Full screen: the paper in the middle, AI writer and outline on the left, actions on top. */
export function DocEditor({ id, c, a, onBack, onOpen, autoWrite }: { id: string; c: Client; a: ClientActions; onBack: () => void; onOpen: (id: string) => void; autoWrite?: string }) {
  const e = useDocEditor(id, c, a, onBack, autoWrite)
  // Escape leaves the editor (saving first) instead of closing the client drawer underneath
  useEffect(() => {
    const esc = (x: KeyboardEvent) => {
      if (x.key === 'Escape') { x.stopPropagation(); if (!e.signing) e.close() }
      if (x.key === 's' && (x.ctrlKey || x.metaKey)) x.preventDefault() // it autosaves anyway
    }
    addEventListener('keydown', esc, true)
    return () => removeEventListener('keydown', esc, true)
  }, [e])
  useEffect(() => { document.body.classList.add('de-open'); return () => document.body.classList.remove('de-open') }, [])
  if (!e.doc || !e.shown) return null

  return createPortal(
    <div className="de" role="dialog" aria-label="Document editor">
      <header className="de-top">
        <Button variant="ghost" onClick={e.close}>← Documents</Button>
        <input className="de-title" value={e.edit.title} onChange={(x) => e.setTitle(x.target.value)} readOnly={!e.isDraft} aria-label="Title" maxLength={200} />
        <Status kind="d" status={e.doc.status}>{label(e.doc.status)}</Status>
        <span className="de-save mono">{e.saveText}</span>
        <div className="de-actions">
          {e.canSign && <Button onClick={e.toggleSigning}>Sign as codedemons</Button>}
          <PdfButton doc={e.shown} />
          {e.canDelete && <ConfirmButton onConfirm={e.remove}>Delete</ConfirmButton>}
          {e.isDraft && <Button variant="primary" disabled={e.ai.writing} onClick={e.send}>Send to client</Button>}
        </div>
      </header>

      <div className="de-main">
        <aside className="de-side">
          <AiPanel e={e} />
          {!e.isDraft && (
            <div className="de-card">
              <span className="mono">Locked</span>
              <p className="crm-hint">{e.sent ? 'Sent to the client, so the text is locked. They get a reminder every 3 days until they sign.' : 'Signed by both sides and kept for your records.'}</p>
              <Button onClick={async () => { const n = await e.duplicate(); if (n) onOpen(n) }}>Copy into a new draft</Button>
            </div>
          )}
          <Outline e={e} />
          <p className="mono de-stats">{e.stats}</p>
        </aside>

        <div className="de-canvas">
          {e.isDraft && (
            <div className="de-tools">
              {e.mode === 'paper' && FORMATS.map(([t, cmd, arg]) => <button key={t} type="button" onMouseDown={format(cmd, arg)}>{t}</button>)}
              {e.mode === 'paper' && <><i /><button type="button" onMouseDown={format('undo')} aria-label="Undo">↶</button><button type="button" onMouseDown={format('redo')} aria-label="Redo">↷</button></>}
              <div className="seg small">
                <button className={e.mode === 'paper' ? 'on' : ''} onClick={() => e.setMode('paper')}>Paper</button>
                <button className={e.mode === 'markdown' ? 'on' : ''} onClick={() => e.setMode('markdown')}>Markdown</button>
              </div>
            </div>
          )}
          {e.mode === 'markdown' && e.isDraft
            ? <textarea className="de-src" value={e.edit.body} onChange={(x) => e.setBody(x.target.value)} spellCheck aria-label="Markdown" />
            : <div className={'de-paper' + (e.ai.writing ? ' writing' : '')}><Paper doc={e.shown} onBody={e.isDraft && !e.ai.writing ? e.setBody : undefined} /></div>}
        </div>
      </div>

      {e.signing && (
        <div className="de-modal" onMouseDown={(x) => x.target === x.currentTarget && e.toggleSigning()}>
          <div className="de-card"><SignPad label="Sign for codedemons" onSign={e.sign} /><Button variant="ghost" onClick={e.toggleSigning}>Cancel</Button></div>
        </div>
      )}
    </div>,
    document.body,
  )
}
