import type { HTMLAttributes } from 'react'
import { Button } from '../../../shared/components/Button'
import { ConfirmButton } from '../../../shared/components/ConfirmButton'
import { ik } from '../../../shared/lib/media'
import type { Item, Resource } from '../config/resources'

type Props = {
  res: Resource; item: Item; first: boolean; last: boolean
  drag: HTMLAttributes<HTMLLIElement>
  onUp: () => void; onDown: () => void; onTogglePublish: () => void; onEdit: () => void; onDelete: () => void
}

export function ContentRow({ res, item: i, first, last, drag, onUp, onDown, onTogglePublish, onEdit, onDelete }: Props) {
  const thumb = res.thumb(i)
  return (
    <li {...drag} className={i.published ? '' : 'draft'}>
      <span className="cp-grip" aria-hidden>::</span>
      <span className="cp-thumb" style={{ background: String(i.tint || '#e9e8e2') }}>
        {thumb && <img src={ik(thumb, 'w-200')} alt="" />}
      </span>
      <div className="cp-meta">
        <b>{res.name(i)}</b>
        <span className="mono">{res.sub(i)}</span>
        <span className="cp-badges">{res.badges(i).map((b) => <em key={b}>{b}</em>)}</span>
      </div>
      <div className="cp-actions">
        <Button variant="ghost" size="sq" onClick={onUp} disabled={first} aria-label="Move up">Up</Button>
        <Button variant="ghost" size="sq" onClick={onDown} disabled={last} aria-label="Move down">Down</Button>
        <Button variant="ghost" onClick={onTogglePublish}>{i.published ? 'Unpublish' : 'Publish'}</Button>
        <Button onClick={onEdit}>Edit</Button>
        <ConfirmButton onConfirm={onDelete}>Delete</ConfirmButton>
      </div>
    </li>
  )
}
