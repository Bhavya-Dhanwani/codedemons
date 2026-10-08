import { Magnetic } from '../../../shared/components/motion/Magnetic'
import { SERVICES } from '../constants'
import { useContactForm } from '../hooks/useContactForm'

function Sent() {
  return (
    <div className="cf-done" role="status">
      <span className="accent-line">Summoned.</span>
      <p>Your message is with both founders. Check your inbox, we'll reply within 24 hours.</p>
    </div>
  )
}

export function ContactForm() {
  const cf = useContactForm()
  if (cf.sent) return <Sent />
  return (
    <form className="cf" onSubmit={cf.submit}>
      <label><span className="mono">Your name</span><input name="name" required minLength={2} maxLength={100} autoComplete="name" placeholder="Jane Doe" /></label>
      <label><span className="mono">Email</span><input name="email" type="email" required maxLength={200} autoComplete="email" placeholder="jane@company.com" /></label>
      <label className="cf-wide"><span className="mono">Company <i>(optional)</i></span><input name="company" maxLength={120} autoComplete="organization" placeholder="Acme Inc." /></label>
      <fieldset className="cf-wide">
        <legend className="mono">I need help with</legend>
        <div className="cf-chips">
          {SERVICES.map((s) => (
            <button type="button" key={s.t} aria-pressed={cf.isPicked(s.t)} onClick={() => cf.togglePick(s.t)}>{s.t}</button>
          ))}
        </div>
      </fieldset>
      <label className="cf-wide"><span className="mono">Tell us about it</span><textarea name="message" required minLength={10} maxLength={4000} rows={4} placeholder="What are you building, and when do you need it?" /></label>
      <input name="website" className="cf-hp" tabIndex={-1} autoComplete="off" aria-hidden="true" />
      <div className="cf-wide cf-foot">
        <p className="cf-err" role="alert">{cf.error}</p>
        <Magnetic><button className="cta-btn" disabled={cf.sending} data-cursor="hidden">{cf.sending ? 'Sending…' : 'Send it'}</button></Magnetic>
      </div>
    </form>
  )
}
