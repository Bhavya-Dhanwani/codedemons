import { useState } from 'react'
import { Button } from '../../../../shared/components/Button'
import { CodeBlock } from '../../../../shared/components/CodeBlock'
import { ConfirmButton } from '../../../../shared/components/ConfirmButton'
import { Field } from '../../../../shared/components/Field'
import type { ClientActions } from '../../hooks/useClientActions'
import { useLicenseTab, type LicenseTabModel } from '../../hooks/useLicenseTab'
import type { Client } from '../../types'
import { CanvasDesigner } from '../license/CanvasDesigner'
import { CanvasView } from '../license/CanvasView'
import { Card } from './OverviewTab'

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <li className="lic-step">
      <span className="lic-n">{n}</span>
      <div><b>{title}</b>{children}</div>
    </li>
  )
}

/** Two ways to put the license on their site, one shown at a time. */
function Install({ l }: { l: LicenseTabModel }) {
  const [how, setHow] = useState<'script' | 'server'>('script')
  const i = l.install
  return (
    <Card title="Install on their website">
      <div className="lic-how">
        <button type="button" className={how === 'script' ? 'on' : ''} onClick={() => setHow('script')}>
          <b>Any website</b><small>One line in the page. Quickest.</small>
        </button>
        <button type="button" className={how === 'server' ? 'on' : ''} onClick={() => setHow('server')}>
          <b>Fullstack app</b><small>Node, Next.js or edge. Can't be blocked.</small>
        </button>
      </div>

      {how === 'script'
        ? (
          <ol className="lic-steps">
            <Step n={1} title="Paste this inside the <head> of every page">
              <CodeBlock label="HTML" code={i.script} />
            </Step>
            <Step n={2} title="That's it">
              <p className="crm-hint">It runs in the visitor's browser, so a determined visitor could block it. For apps with their own server, use the Fullstack option.</p>
            </Step>
          </ol>
        )
        : (
          <ol className="lic-steps">
            <Step n={1} title="Download the guard into their project, and commit it">
              <CodeBlock label="Terminal" code={i.download} />
            </Step>
            <Step n={2} title="Run it before everything else on their server">
              <CodeBlock label="Express, Nest, plain Node" code={i.server} />
              <details className="lic-more"><summary>Next.js middleware or an edge runtime instead</summary><CodeBlock label="Edge" code={i.edge} /></details>
            </Step>
            <Step n={3} title="Add the key to their environment">
              <CodeBlock label=".env" code={i.env} />
            </Step>
          </ol>
        )}
    </Card>
  )
}

export function LicenseTab({ c, a }: { c: Client; a: ClientActions }) {
  const l = useLicenseTab(c, a)
  if (!l.exists) return (
    <div className="cl-narrow">
      <Card title="Control their website from here">
        <p className="crm-hint">Create a license and add one line to their site. You can then switch it off anytime, or let it go into maintenance automatically when payments stop. Paid invoices can extend it.</p>
        <Button variant="primary" onClick={l.create}>Create license</Button>
      </Card>
    </div>
  )

  return (
    <div className="cl-cols">
      <div className="cl-main">
        <section className={'lic ' + l.status.tone}>
          <span className="lic-dot" aria-hidden />
          <div className="lic-state">
            <b>{l.status.text}</b>
            <small>{l.status.paid || 'No payment date set: stays on until you switch it off'}</small>
          </div>
          <label className="lic-switch">
            <span>{l.on ? 'On' : 'Off'}</span>
            <input type="checkbox" className="cp-switch" checked={l.on} onChange={l.toggle} aria-label="Website on" />
          </label>
        </section>
        <p className="crm-hint lic-note">Switching it off reaches their site within about 10 minutes.</p>

        <Install l={l} />
      </div>

      <aside className="cl-aside">
        <Card title="Maintenance page" aside={<small className="crm-hint">{l.design.custom ? 'Custom design' : 'Default page'}</small>}>
          <button type="button" className="mp-card" onClick={l.design.start} aria-label="Open the maintenance page designer">
            <CanvasView c={l.design.canvas} />
          </button>
          <Button variant="primary" onClick={l.design.start}>Open designer</Button>
        </Card>
        {l.design.open && <CanvasDesigner initial={l.design.canvas} logo={l.design.logo} onSave={l.design.save} onClose={l.design.stop} />}

        <Card title="Settings">
          <Field label="Domain" hint="Works only on this domain and its subdomains. Empty = any domain."><input placeholder="clientsite.com" {...l.field('domain')} /></Field>
          <div className="two">
            <Field label="Paid until" hint="Empty = never expires"><input type="date" {...l.field('paidUntil')} /></Field>
            <Field label="Grace days" hint="Stays live this long after"><input type="number" min={0} max={90} {...l.field('graceDays')} /></Field>
          </div>
          <Field label="Message for apps and API calls" hint="Sent with the 503 error while the site is down"><input maxLength={300} placeholder="This website is under maintenance. Please check back soon." {...l.field('message')} /></Field>
          <Button variant="primary" disabled={!l.canSave} onClick={l.save}>Save settings</Button>
        </Card>

        <Card title="License key">
          <code className="lic-key">{l.key}</code>
          <div className="cp-row">
            <Button onClick={() => l.copy(l.key)}>Copy</Button>
            <ConfirmButton onConfirm={l.replaceKey} confirm="The old key stops working. Sure?">Replace key</ConfirmButton>
          </div>
        </Card>
      </aside>
    </div>
  )
}
