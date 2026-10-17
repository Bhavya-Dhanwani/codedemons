import { Button } from '../../../../shared/components/Button'
import { RowButton, RowList, Status } from '../../../../shared/components/Lists'
import type { ClientActions } from '../../hooks/useClientActions'
import { useDocsTab } from '../../hooks/useDocsTab'
import type { Client } from '../../types'
import { DocEditor } from './DocEditor'

type Tab = ReturnType<typeof useDocsTab>

function AiStart({ ai }: { ai: Tab['ai'] }) {
  if (!ai.on) return <p className="crm-hint">Add <code>MISTRAL_API_KEY</code> to <code>server/.env</code> to have AI write documents from the project brief.</p>
  return (
    <div className="tpl-ai">
      <span className="mono">Write with AI</span>
      <div className="ad-row">
        <select value={ai.kind} onChange={(e) => ai.setKind(e.target.value)} aria-label="Document type">
          {ai.kinds.map(([k, t]) => <option key={k} value={k}>{t}</option>)}
        </select>
      </div>
      <textarea rows={3} value={ai.ask} onChange={(e) => ai.setAsk(e.target.value)} placeholder="Anything it should know: price, timeline, pages, special terms. It already knows the client and their project brief." />
      <Button variant="primary" disabled={ai.busy} onClick={ai.generate}>Generate draft</Button>
    </div>
  )
}

function TemplatePicker({ t }: { t: Tab }) {
  return (
    <>
      <div className="ad-row"><Button variant="ghost" onClick={t.back}>Back</Button><b>New document</b></div>
      <AiStart ai={t.ai} />
      <span className="mono pt-muted">Or start from a template</span>
      <div className="tpl-grid">
        {t.templates.map((x) => <button key={x.title} className="tpl" onClick={() => t.create(x)}><b>{x.title}</b><small>{x.hint}</small></button>)}
      </div>
    </>
  )
}

export function DocsTab({ c, a }: { c: Client; a: ClientActions }) {
  const t = useDocsTab(c)
  const list = (
    <>
      <div className="ad-row spread"><b>{t.heading}</b><Button variant="primary" onClick={t.pickTemplate}>New document</Button></div>
      {!t.docs.length && <p className="crm-hint">Proposal, contract, NDA, SRS, onboarding: let AI write it from the brief, or pick a template. Edit right on the page, then send. They sign in their portal.</p>}
      <RowList>
        {t.docs.map((d) => (
          <RowButton key={d._id} onClick={() => t.open(d._id)}>
            <b>{d.title}</b>
            <Status kind="d" status={d.status}>{d.statusText}</Status>
            <small>{d.whenText}</small>
          </RowButton>
        ))}
      </RowList>
    </>
  )
  if (t.mode === 'pick') return <TemplatePicker t={t} />
  if (t.mode !== 'list') return <>{list}<DocEditor key={t.mode} id={t.mode} c={c} a={a} onBack={t.back} onOpen={t.open} autoWrite={t.autoWrite} /></>
  return list
}
