import { Button } from '../../../shared/components/Button'
import { Field } from '../../../shared/components/Field'
import { useCodeStep } from '../hooks/useCodeStep'
import { AuthCard } from './AuthShell'

/** "Check your email": enter the 6 digit code. */
export function CodeStep({ email, intro, onBack }: { email: string; intro: string; onBack: () => void }) {
  const c = useCodeStep(email)
  return (
    <AuthCard
      title="Check your email"
      intro={<>{intro}<b>{email}</b>. It works for 10 minutes.</>}
      error={c.error}
      onSubmit={c.submit}
      foot={<button type="button" className="mono ad-back" onClick={onBack}>Use a different email</button>}
    >
      <Field label="6 digit code" error={c.errors.code}>
        <input className="pt-code" inputMode="numeric" autoComplete="one-time-code" maxLength={6} {...c.field('code')} autoFocus />
      </Field>
      <Button type="submit" variant="primary" disabled={c.busy}>{c.busy ? 'Checking' : 'Log in'}</Button>
    </AuthCard>
  )
}
