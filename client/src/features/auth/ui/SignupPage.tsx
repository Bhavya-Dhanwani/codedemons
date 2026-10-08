import { Button } from '../../../shared/components/Button'
import { Field } from '../../../shared/components/Field'
import { useSignup } from '../hooks/useSignup'
import { AuthCard, AuthLink } from './AuthShell'
import { CodeStep } from './CodeStep'

/** Client signup: name + email (company, phone optional), then the emailed code. */
export default function SignupPage() {
  const f = useSignup()
  if (f.codeSent) return <CodeStep email={f.email} intro="Your account is ready. We sent a code to " onBack={f.back} />
  return (
    <AuthCard
      title="Start a project"
      intro="Create your client account to follow progress, sign documents and pay invoices in one place."
      error={f.error}
      onSubmit={f.submit}
      foot={<>
        <AuthLink to="/portal/login">Already have an account? Log in</AuthLink>
        <AuthLink to="/">Back to site</AuthLink>
      </>}
    >
      <Field label="Your name" error={f.errors.name}><input autoComplete="name" maxLength={100} {...f.field('name')} autoFocus /></Field>
      <Field label="Email" error={f.errors.email}><input type="email" autoComplete="email" maxLength={200} {...f.field('email')} /></Field>
      <Field label="Company (optional)" error={f.errors.company}><input autoComplete="organization" maxLength={120} {...f.field('company')} /></Field>
      <Field label="Phone (optional)" error={f.errors.phone}><input type="tel" autoComplete="tel" maxLength={20} placeholder="+91 98765 43210" {...f.field('phone')} /></Field>
      <input className="cf-hp" tabIndex={-1} autoComplete="off" aria-hidden="true" {...f.field('website')} />
      <Button type="submit" variant="primary" disabled={f.busy}>{f.busy ? 'Creating' : 'Create account'}</Button>
    </AuthCard>
  )
}
