import { Field } from '../../../shared/components/Field'
import { hasButtons, type Field as FieldDef, type Result } from '../config/resources'
import { MediaInput } from './MediaInput'
import { GalleryInput, ResultsInput } from './ListInputs'

type Props = { f: FieldDef; v: unknown; set: (k: string, v: unknown) => void; setList: (k: string, text: string) => void }

/** The right input for a field definition. */
export function FieldControl({ f, v, set, setList }: Props) {
  return (
    <Field label={f.label} hint={f.hint} className={'f-' + f.type} as={hasButtons(f) ? 'div' : 'label'}>
      {f.type === 'text' && <input value={String(v ?? '')} required={f.required} onChange={(e) => set(f.key, e.target.value)} />}
      {f.type === 'textarea' && <textarea rows={4} value={String(v ?? '')} onChange={(e) => set(f.key, e.target.value)} />}
      {f.type === 'color' && <div className="ad-row"><input type="color" value={String(v)} onChange={(e) => set(f.key, e.target.value)} /><code>{String(v)}</code></div>}
      {f.type === 'bool' && <input type="checkbox" className="ad-switch" checked={!!v} onChange={(e) => set(f.key, e.target.checked)} />}
      {f.type === 'list' && <input value={(v as string[]).join(', ')} onChange={(e) => setList(f.key, e.target.value)} />}
      {f.type === 'media' && <MediaInput value={String(v ?? '')} accept={f.accept} onChange={(u) => set(f.key, u)} />}
      {f.type === 'results' && <ResultsInput value={v as Result[]} onChange={(x) => set(f.key, x)} />}
      {f.type === 'gallery' && <GalleryInput value={v as string[]} onChange={(x) => set(f.key, x)} />}
    </Field>
  )
}
