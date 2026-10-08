import { Button } from '../../../../shared/components/Button'
import { ConfirmButton } from '../../../../shared/components/ConfirmButton'
import { Field } from '../../../../shared/components/Field'
import type { ClientActions } from '../../hooks/useClientActions'
import { useLicenseTab } from '../../hooks/useLicenseTab'
import type { Client } from '../../types'
import { MaintenanceDesigner } from '../license/MaintenanceDesigner'

export function LicenseTab({ c, a }: { c: Client; a: ClientActions }) {
  const l = useLicenseTab(c, a)
  if (!l.exists) return (
    <div className="crm-callout col">
      <b>Control their website from here.</b>
      <p>Create a license, add one line to their site, and you can switch it off anytime or let it go into maintenance automatically when payments stop. Paid invoices can extend it.</p>
      <Button variant="primary" onClick={l.create}>Create license</Button>
    </div>
  )

  return (
    <>
      <div className={'lic ' + l.status.tone}>
        <div><span className="mono">Status</span><b>{l.status.text}</b>{l.status.paid && <small>{l.status.paid}</small>}</div>
        <label className="lic-switch">
          <span>{l.on ? 'On' : 'Off'}</span>
          <input type="checkbox" className="ad-switch" checked={l.on} onChange={l.toggle} aria-label="Website on" />
        </label>
      </div>
      <p className="crm-hint">Switching off takes effect on the site within about 10 minutes.</p>

      <Field label="Website: add this to their <head>" hint="Any site. Runs in the visitor's browser, so a determined visitor can block it." as="div">
        <div className="snippet"><code>{l.snippet}</code><Button onClick={() => l.copy(l.snippet)}>Copy</Button></div>
      </Field>
      <Field label="Fullstack app (Node, Next.js or edge backend): use this instead" hint="Strongest: checked on their server, so the real site is never sent while it's off." as="div">
        <div className="snippet"><code className="pre">{l.serverSnippet}</code><Button onClick={() => l.copy(l.serverSnippet)}>Copy</Button></div>
      </Field>

      <details className="crm-more">
        <summary>Maintenance page visitors see while it's down</summary>
        <MaintenanceDesigner l={l} />
      </details>

      <details className="crm-more">
        <summary>Domain and payment</summary>
        <div className="ad-fields flat">
          <Field label="Domain" hint="Only works on this domain and its subdomains. Empty = any domain."><input placeholder="clientsite.com" {...l.field('domain')} /></Field>
          <div className="two">
            <Field label="Paid until" hint="Empty = never expires"><input type="date" {...l.field('paidUntil')} /></Field>
            <Field label="Grace days" hint="Stays live this long after"><input type="number" min={0} max={90} {...l.field('graceDays')} /></Field>
          </div>
          <div className="ad-row">
            <Button variant="primary" disabled={!l.canSave} onClick={l.save}>Save</Button>
            <ConfirmButton onConfirm={l.replaceKey} confirm="Old key stops working. Sure?">Replace key</ConfirmButton>
          </div>
        </div>
      </details>
    </>
  )
}
