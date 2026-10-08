import { Button } from '../../../shared/components/Button'
import { Drawer } from '../../../shared/components/Drawer'
import { ErrorText } from '../../../shared/components/Feedback'
import type { Item, Resource } from '../config/resources'
import { useContentEditor } from '../hooks/useContentEditor'
import { FieldControl } from './FieldControl'

type Props = { res: Resource; item: Item; onClose: () => void; onSaved: () => void }

export function ContentEditor({ res, item, onClose, onSaved }: Props) {
  const ed = useContentEditor(res, item, onSaved)
  return (
    <Drawer title={ed.title} onClose={onClose} foot={<>
      <ErrorText>{ed.error}</ErrorText>
      <Button variant="ghost" onClick={onClose}>Cancel</Button>
      <Button type="submit" form="content-editor" variant="primary" disabled={ed.busy}>{ed.busy ? 'Saving' : 'Save'}</Button>
    </>}>
      <form id="content-editor" className="ad-fields" onSubmit={ed.submit}>
        {res.fields.map((f) => <FieldControl key={f.key} f={f} v={ed.d[f.key]} set={ed.set} setList={ed.setList} />)}
      </form>
    </Drawer>
  )
}
