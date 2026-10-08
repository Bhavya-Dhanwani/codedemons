import { Button } from '../../../shared/components/Button'
import { EmptyState, ErrorText } from '../../../shared/components/Feedback'
import { PanelHead } from '../../../shared/components/PanelHead'
import type { Resource } from '../config/resources'
import { useContentList } from '../hooks/useContentList'
import { ContentRow } from './ContentRow'
import { ContentEditor } from './ContentEditor'

/** /admin/projects and /admin/reviews. */
export default function ContentManager({ res }: { res: Resource }) {
  const m = useContentList(res)
  return (
    <section className="ad-panel">
      <PanelHead title={res.title} sub={m.summary} action={<Button variant="primary" onClick={m.openNew}>New {res.noun}</Button>} />
      <ErrorText onDismiss={m.clearError}>{m.error}</ErrorText>
      {m.items && !m.items.length && (
        <EmptyState><p>No {res.title.toLowerCase()} yet.</p><Button onClick={m.openNew}>Add the first one</Button></EmptyState>
      )}
      <ol className="ad-list">
        {m.items?.map((i, k, all) => (
          <ContentRow
            key={i._id} res={res} item={i} first={k === 0} last={k === all.length - 1} drag={m.dragProps(k)}
            onUp={() => m.move(k, k - 1)} onDown={() => m.move(k, k + 1)}
            onTogglePublish={() => m.togglePublish(i)} onEdit={() => m.openEdit(i)} onDelete={() => m.remove(i)}
          />
        ))}
      </ol>
      {m.editing && <ContentEditor res={res} item={m.editing} onClose={m.closeEditor} onSaved={m.onSaved} />}
    </section>
  )
}
