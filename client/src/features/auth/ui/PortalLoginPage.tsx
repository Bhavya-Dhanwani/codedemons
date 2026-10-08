import { Button } from '../../../shared/components/Button'
import { Field } from '../../../shared/components/Field'
import { usePortalLogin } from '../hooks/usePortalLogin'
import { AuthCard, AuthLink } from './AuthShell'
import { CodeStep } from './CodeStep'

/** Client login: email, then the emailed code. No password. */
export default function PortalLoginPage() {
  const f = usePortalLogin()
  if (f.codeSent) return <CodeStep email={f.email} intro="If this email has a portal, a code is on its way to " onBack={f.back} />
  return (
    <AuthCard
      title="Your project"
      intro="Enter the email we have on file. We'll send you a 6 digit code, no password needed."
      error={f.error}
      onSubmit={f.submit}
      foot={<>
        <AuthLink to="/portal/signup">New here? Create an account</AuthLink>
        <AuthLink to="/">Back to site</AuthLink>
      </>}
    >
      <Field label="Email" error={f.errors.email}><input type="email" autoComplete="email" maxLength={200} {...f.field('email')} autoFocus /></Field>
      <Button type="submit" variant="primary" disabled={f.busy}>{f.busy ? 'Sending' : 'Email me a code'}</Button>
    </AuthCard>
  )
}
