import { Button } from '../../../../shared/components/Button'
import { ErrorText } from '../../../../shared/components/Feedback'
import { Field } from '../../../../shared/components/Field'
import { useNewProject } from '../../hooks/useNewProject'

/** What they need, in their words. Used for the very first project and for every new one. */
export function NewProjectForm() {
  const f = useNewProject()
  return (
    <form className="np" onSubmit={f.submit}>
      <Field label="Project name"><input {...f.field('name')} placeholder="e.g. New website for Acme Bakery" maxLength={120} required autoFocus /></Field>
      <Field label="What do you need?" hint="Goals, pages, features, sites you like. Rough is fine, we'll ask the rest.">
        <textarea {...f.field('brief')} rows={6} maxLength={6000} placeholder="We sell cakes and want customers to order and pay on the site. Something warm and modern." required />
      </Field>
      <Field label="Services" as="div">
        <div className="np-chips">
          {f.services.map((s) => <button key={s.s} type="button" aria-pressed={s.on} onClick={s.toggle}>{s.s}</button>)}
        </div>
      </Field>
      <div className="two">
        <Field label="Budget">
          <select {...f.field('budget')}>{f.budgets.map((b) => <option key={b} value={b}>{b || 'Choose a range'}</option>)}</select>
        </Field>
        <Field label="Wanted by" hint="Optional"><input type="date" {...f.field('deadline')} /></Field>
      </div>
      <ErrorText>{f.error}</ErrorText>
      <Button type="submit" variant="primary" size="big" disabled={!f.canSubmit}>{f.busy ? 'Creating' : 'Create project'}</Button>
    </form>
  )
}
