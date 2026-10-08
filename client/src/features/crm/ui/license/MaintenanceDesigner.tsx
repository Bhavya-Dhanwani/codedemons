import { Button } from '../../../../shared/components/Button'
import { Field } from '../../../../shared/components/Field'
import { MediaInput } from '../../../admin/ui/MediaInput'
import { IMG } from '../../../admin/config/resources'
import type { LicenseTabModel } from '../../hooks/useLicenseTab'
import { MaintenancePreview } from './MaintenancePreview'

function ColorField({ label, field }: { label: string; field: { value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void } }) {
  return (
    <Field label={label}>
      <div className="ad-row"><input type="color" {...field} /><code>{field.value}</code></div>
    </Field>
  )
}

/** Design the page visitors see while the site is switched off or unpaid. Live preview on the right. */
export function MaintenanceDesigner({ l }: { l: LicenseTabModel }) {
  return (
    <div className="mp">
      <div className="ad-fields flat">
        <Field label="Logo" as="div"><MediaInput value={l.page.logo} accept={IMG} onChange={l.setLogo} /></Field>
        <Field label="Heading" hint="Empty = “Temporarily unavailable”"><input maxLength={80} placeholder="Temporarily unavailable" {...l.pageField('heading')} /></Field>
        <Field label="Message" hint="Empty = the default maintenance line"><input maxLength={300} placeholder="This website is under maintenance. Please check back soon." {...l.field('message')} /></Field>
        <div className="two">
          <ColorField label="Background" field={l.pageField('bg')} />
          <ColorField label="Text" field={l.pageField('fg')} />
        </div>
        <ColorField label="Button colour" field={l.pageField('accent')} />
        <div className="two">
          <Field label="Button text" hint="Empty = no button"><input maxLength={40} placeholder="Email us" {...l.pageField('buttonLabel')} /></Field>
          <Field label="Button link" error={l.linkError}><input maxLength={300} placeholder="mailto:hello@client.com" {...l.pageField('buttonUrl')} /></Field>
        </div>
        <div className="ad-row">
          <Button variant="primary" disabled={!l.canSave} onClick={l.save}>Save</Button>
          <Button variant="ghost" onClick={l.resetDesign}>Reset colours and text</Button>
        </div>
      </div>
      <MaintenancePreview p={l.preview} />
    </div>
  )
}
