import { Button } from '../../../shared/components/Button'
import { IMG, type Result } from '../config/resources'
import { useArrayField } from '../hooks/useArrayField'
import { MediaInput } from './MediaInput'

const MAX_RESULTS = 6

/** Big number + label pairs. */
export function ResultsInput({ value, onChange }: { value: Result[]; onChange: (v: Result[]) => void }) {
  const list = useArrayField(value, onChange)
  return (
    <div className="ad-results">
      {list.items.map((r, k) => (
        <div className="ad-row" key={k}>
          <input placeholder="+184%" value={r.v} onChange={(e) => list.update(k, { ...r, v: e.target.value })} />
          <input placeholder="Conversion rate" value={r.l} onChange={(e) => list.update(k, { ...r, l: e.target.value })} />
          <Button variant="ghost" onClick={() => list.remove(k)} aria-label="Remove result">x</Button>
        </div>
      ))}
      {list.items.length < MAX_RESULTS && <Button variant="ghost" onClick={() => list.add({ v: '', l: '' })}>Add result</Button>}
    </div>
  )
}

/** Gallery images, plus an empty slot that adds one. Removing an image's file removes it from the gallery. */
export function GalleryInput({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const list = useArrayField(value, onChange)
  return (
    <div className="ad-gallery">
      {list.items.map((u, k) => (
        <MediaInput key={u + k} value={u} accept={IMG} onChange={(nu) => (nu ? list.update(k, nu) : list.remove(k))} />
      ))}
      <MediaInput key={'new' + list.items.length} value="" accept={IMG} onChange={(nu) => nu && list.add(nu)} />
    </div>
  )
}
