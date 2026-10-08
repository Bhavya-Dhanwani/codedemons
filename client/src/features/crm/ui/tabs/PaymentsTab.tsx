import { Button } from '../../../../shared/components/Button'
import { ConfirmButton } from '../../../../shared/components/ConfirmButton'
import { Field } from '../../../../shared/components/Field'
import { Status } from '../../../../shared/components/Lists'
import { LICENSE_EXTEND } from '../../constants'
import type { ClientActions } from '../../hooks/useClientActions'
import { usePaymentsTab, type InvoiceRowData } from '../../hooks/usePaymentsTab'
import type { Client } from '../../types'

function InvoiceRow({ i, onPaid, onDelete }: { i: InvoiceRowData; onPaid: () => void; onDelete: () => void }) {
  return (
    <li className="static">
      <div>
        <b>{i.title}</b>
        <small>{i.sub}</small>
      </div>
      <span className="crm-val">{i.amountText}</span>
      <Status kind="i" status={i.status}>{i.statusText}</Status>
      {i.open && (
        <div className="ad-row">
          <Button onClick={onPaid}>Mark paid</Button>
          <ConfirmButton size="sq" aria-label="Delete invoice" onConfirm={onDelete}>×</ConfirmButton>
        </div>
      )}
    </li>
  )
}

export function PaymentsTab({ c, a }: { c: Client; a: ClientActions }) {
  const p = usePaymentsTab(c, a)
  return (
    <>
      {!p.adding && <div className="ad-row spread"><b>{p.heading}</b><Button variant="primary" onClick={p.startAdding}>New invoice</Button></div>}
      {p.adding && (
        <form className="crm-callout col" onSubmit={p.submit}>
          <Field label="For"><input placeholder="e.g. Website, first 50%" {...p.field('title')} required /></Field>
          <div className="two">
            <Field label="Amount (₹)"><input type="number" min={1} {...p.field('amount')} required /></Field>
            <Field label="Due"><input type="date" {...p.field('dueAt')} required /></Field>
          </div>
          {p.hasLicense && (
            <Field label="When paid, extend their license by" hint="Use for maintenance plans">
              <select {...p.field('licenseDays')}>
                {LICENSE_EXTEND.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </Field>
          )}
          <p className="crm-hint">{p.hint}</p>
          <div className="ad-row">
            <Button type="submit" variant="primary">Create invoice</Button>
            {p.canCancel && <Button variant="ghost" onClick={p.cancel}>Cancel</Button>}
          </div>
        </form>
      )}
      <ul className="crm-rows">
        {p.invoices.map((i) => <InvoiceRow key={i._id} i={i} onPaid={() => p.markPaid(i._id)} onDelete={() => p.remove(i._id)} />)}
      </ul>
    </>
  )
}
