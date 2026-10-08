import { Link } from 'react-router'
import { Button, buttonClass } from '../../../shared/components/Button'
import { ErrorText, Muted } from '../../../shared/components/Feedback'
import { Field } from '../../../shared/components/Field'
import { usePayment } from '../hooks/usePayment'

type Pay = ReturnType<typeof usePayment>

function OnlinePay({ p }: { p: Pay }) {
  return (
    <>
      <Button variant="primary" size="big" onClick={p.pay}>Pay {p.amount}</Button>
      <small className="pt-muted">UPI, cards or netbanking. Opens a secure Razorpay page.</small>
      {p.waiting && <p className="pt-wait"><i /> Waiting for your payment. This page updates by itself.</p>}
    </>
  )
}

function UpiPay({ p }: { p: Pay }) {
  return (
    <>
      {p.mobile
        ? <a className={buttonClass({ variant: 'primary', size: 'big' })} href={p.inv!.upi}>Pay with a UPI app</a>
        : p.qr && <img className="pt-qr" src={p.qr} alt={`UPI QR code for ${p.amount}`} />}
      <small className="pt-muted">{p.mobile ? 'Opens GPay, PhonePe, Paytm or your bank app.' : 'Scan with any UPI app: GPay, PhonePe, Paytm.'} The amount is filled in for you.</small>
      {!p.claiming
        ? <Button onClick={p.startClaim}>I've paid</Button>
        : (
          <form className="pt-claim" onSubmit={p.submitClaim}>
            <Field label="UTR / reference number"><input value={p.utr} onChange={(e) => p.setUtr(e.target.value)} placeholder="12 digits, shown in your UPI app" required autoFocus /></Field>
            <Button type="submit" variant="primary">Confirm payment</Button>
          </form>
        )}
    </>
  )
}

/** /portal/payments/:id */
export default function PaymentPage() {
  const p = usePayment()
  if (!p.inv) return <ErrorText>{p.error}</ErrorText>
  const { inv } = p
  return (
    <>
      <Link to="/portal/payments" className={buttonClass({ variant: 'ghost' })}>All payments</Link>
      <div className="pt-pay">
        <span className="mono">{inv.number}</span>
        <h2>{p.amount}</h2>
        <p>{inv.title}</p>
        {inv.status === 'paid' && <p className="pt-ok big">Payment received{p.paidText}. Thank you!</p>}
        {inv.status === 'verifying' && <p className="pt-ok">We got your payment details and are confirming it. You'll get an email.</p>}
        {p.online && <OnlinePay p={p} />}
        {p.upi && <UpiPay p={p} />}
        {p.noMethod && <Muted>Online payment isn't set up yet. We'll share payment details by email.</Muted>}
        <ErrorText>{p.error}</ErrorText>
      </div>
    </>
  )
}
