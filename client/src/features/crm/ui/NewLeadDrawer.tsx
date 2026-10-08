import { Button } from '../../../shared/components/Button'
import { Drawer } from '../../../shared/components/Drawer'
import { ErrorText } from '../../../shared/components/Feedback'
import { Field } from '../../../shared/components/Field'
import { useNewLead } from '../hooks/useNewLead'

export function NewLeadDrawer({ onClose, onSaved }: { onClose: () => void; onSaved: (id: string) => void }) {
  const f = useNewLead(onSaved)
  return (
    <Drawer title="New lead" onClose={onClose} wide>
      <form className="ad-fields" onSubmit={f.submit}>
        <Field label="Name"><input {...f.field('name')} required autoFocus /></Field>
        <Field label="Email"><input type="email" {...f.field('email')} /></Field>
        <Field label="Phone"><input type="tel" {...f.field('phone')} /></Field>
        <Field label="Company"><input {...f.field('company')} /></Field>
        <Field label="Deal value (₹)" hint="Rough is fine, it adds up your pipeline"><input type="number" min={0} {...f.field('value')} /></Field>
        <Field label="Follow up on"><input type="date" {...f.field('followUpAt')} /></Field>
        <ErrorText>{f.error}</ErrorText>
        <Button type="submit" variant="primary">Add lead</Button>
      </form>
    </Drawer>
  )
}
