import { Button } from '../../../shared/components/Button'
import { ErrorText } from '../../../shared/components/Feedback'
import { useMediaUpload } from '../hooks/useMediaUpload'

type Props = { value: string; accept: string; onChange: (url: string) => void }

/** Image / video slot: click the preview or "Upload", see progress, replace or remove. */
export function MediaInput({ value, accept, onChange }: Props) {
  const m = useMediaUpload(value, onChange)
  return (
    <div className="ad-media">
      <div className="ad-prev" onClick={m.browse}>
        {m.preview
          ? (m.preview.video ? <video src={m.preview.src} muted playsInline controls /> : <img src={m.preview.src} alt="" />)
          : <span className="mono">No file</span>}
        {m.uploading && <div className="ad-prog"><i style={{ width: `${m.percent}%` }} /><span className="mono">{m.percent}%</span></div>}
      </div>
      <div className="ad-row">
        <Button onClick={m.browse} disabled={m.uploading}>{value ? 'Replace' : 'Upload'}</Button>
        {value && <Button variant="ghost" onClick={m.clear}>Remove</Button>}
      </div>
      <ErrorText>{m.error}</ErrorText>
      <input ref={m.input} type="file" accept={accept} hidden onChange={m.onFile} />
    </div>
  )
}
