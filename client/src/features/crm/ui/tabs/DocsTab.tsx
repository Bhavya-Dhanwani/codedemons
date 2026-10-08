import { Button } from '../../../../shared/components/Button'
import { RowButton, RowList, Status } from '../../../../shared/components/Lists'
import type { ClientActions } from '../../hooks/useClientActions'
import { useDocsTab } from '../../hooks/useDocsTab'
import type { Client, Template } from '../../types'
import { DocEditor } from './DocEditor'

function TemplatePicker({ templates, onPick, onBack }: { templates: Template[]; onPick: (t: Template) => void; onBack: () => void }) {
  return (
    <>
      <div className="ad-row"><Button variant="ghost" onClick={onBack}>Back</Button><b>Pick a template</b></div>
      <div className="tpl-grid">
        {templates.map((t) => <button key={t.title} className="tpl" onClick={() => onPick(t)}><b>{t.title}</b><small>{t.hint}</small></button>)}
      </div>
    </>
  )
}

export function DocsTab({ c, a }: { c: Client; a: ClientActions }) {
  const t = useDocsTab(c)
  if (t.mode === 'pick') return <TemplatePicker templates={t.templates} onPick={t.create} onBack={t.back} />
  if (t.mode !== 'list') return <DocEditor id={t.mode} a={a} onBack={t.back} />
  return (
    <>
      <div className="ad-row spread"><b>{t.heading}</b><Button variant="primary" onClick={t.pickTemplate}>New document</Button></div>
      {!t.docs.length && <p className="crm-hint">Proposal, contract, NDA, SRS, onboarding: pick a template, it fills in their details, you tweak and send. They sign in their portal.</p>}
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
}
