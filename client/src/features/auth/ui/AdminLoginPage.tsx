import { Button } from '../../../shared/components/Button'
import { Field } from '../../../shared/components/Field'
import { useAdminLogin } from '../hooks/useAdminLogin'
import { AuthCard, AuthLink } from './AuthShell'

export default function AdminLoginPage() {
  const f = useAdminLogin()
  return (
    <AuthCard title="Admin" error={f.error} onSubmit={f.submit} foot={<AuthLink to="/">Back to site</AuthLink>}>
      <Field label="Email" error={f.errors.email}><input type="email" autoComplete="username" maxLength={200} {...f.field('email')} autoFocus /></Field>
      <Field label="Password" error={f.errors.password}><input type="password" autoComplete="current-password" maxLength={200} {...f.field('password')} /></Field>
      <Button type="submit" variant="primary" disabled={f.busy}>{f.busy ? 'Checking' : 'Log in'}</Button>
    </AuthCard>
  )
}
