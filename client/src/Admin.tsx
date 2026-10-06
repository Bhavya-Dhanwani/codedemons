import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react'
import { api, auth, clearCache, ik, ikPoster } from './api'
import { Logo } from './Logo'

// ---------- field definitions: one generic editor serves both resources ----------
type Field =
  | { key: string; label: string; type: 'text' | 'textarea' | 'color' | 'bool' | 'list'; hint?: string; required?: boolean }
  | { key: string; label: string; type: 'media'; accept: string; hint?: string }
  | { key: string; label: string; type: 'gallery' | 'results'; hint?: string }

type Item = { _id?: string; published?: boolean; order?: number; [k: string]: unknown }

type Resource = {
  path: '/admin/projects' | '/admin/reviews'
  title: string
  noun: string
  blank: Item
  fields: Field[]
  thumb: (i: Item) => string
  name: (i: Item) => string
  sub: (i: Item) => string
  badges: (i: Item) => string[]
}

const IMG = 'image/jpeg,image/png,image/webp,image/avif,image/gif'
const VID = 'video/mp4,video/webm,video/quicktime'

const PROJECTS: Resource = {
  path: '/admin/projects', title: 'Projects', noun: 'project',
  blank: { name: '', slug: '', kind: '', year: String(new Date().getFullYear()), client: '', services: [], intro: '', challenge: '', solution: '', results: [], tint: '#e9e8e2', liveUrl: '', cover: '', detail: '', gallery: [], video: '', featured: false, published: true },
  fields: [
    { key: 'name', label: 'Name', type: 'text', required: true },
    { key: 'slug', label: 'URL slug', type: 'text', hint: 'Leave empty to generate from the name. Lives at /work/slug' },
    { key: 'kind', label: 'Type', type: 'text', hint: 'Used for the filters on the All work page, e.g. E-commerce' },
    { key: 'year', label: 'Year', type: 'text' },
    { key: 'client', label: 'Client', type: 'text' },
    { key: 'services', label: 'Services', type: 'list', hint: 'Comma separated' },
    { key: 'liveUrl', label: 'Live site URL', type: 'text', hint: 'https://...' },
    { key: 'intro', label: 'One line intro', type: 'textarea' },
    { key: 'challenge', label: 'The challenge', type: 'textarea' },
    { key: 'solution', label: 'What we did', type: 'textarea' },
    { key: 'results', label: 'Results', type: 'results', hint: 'Big number + label, up to 6' },
    { key: 'cover', label: 'Cover image', type: 'media', accept: IMG, hint: 'Landscape, about 1600px wide' },
    { key: 'detail', label: 'Detail image', type: 'media', accept: IMG },
    { key: 'video', label: 'Project video', type: 'media', accept: VID, hint: 'Plays on hover in the grid and as the hero of the project page' },
    { key: 'gallery', label: 'Gallery', type: 'gallery' },
    { key: 'tint', label: 'Accent colour', type: 'color' },
    { key: 'featured', label: 'Feature on home page', type: 'bool' },
    { key: 'published', label: 'Published', type: 'bool' },
  ],
  thumb: (i) => String(i.cover || ikPoster(String(i.video || ''), 200)),
  name: (i) => String(i.name),
  sub: (i) => [i.kind, i.year].filter(Boolean).join(', '),
  badges: (i) => [!i.published && 'Draft', i.featured && 'Featured', i.video && 'Video'].filter(Boolean) as string[],
}

const REVIEWS: Resource = {
  path: '/admin/reviews', title: 'Reviews', noun: 'review',
  blank: { who: '', company: '', quote: '', video: '', poster: '', published: true },
  fields: [
    { key: 'who', label: 'Client name', type: 'text', required: true },
    { key: 'company', label: 'Company', type: 'text' },
    { key: 'quote', label: 'Quote', type: 'textarea', hint: 'Shown over the video before it plays' },
    { key: 'video', label: 'Review video', type: 'media', accept: VID },
    { key: 'poster', label: 'Poster image', type: 'media', accept: IMG, hint: 'Frame shown before playing' },
    { key: 'published', label: 'Published', type: 'bool' },
  ],
  thumb: (i) => String(i.poster || ikPoster(String(i.video || ''), 200)),
  name: (i) => String(i.who),
  sub: (i) => String(i.company || ''),
  badges: (i) => [!i.published && 'Draft', i.video && 'Video'].filter(Boolean) as string[],
}

// ---------- upload with progress (fetch has no upload progress) ----------
type IKAuth = { enabled: false } | { enabled: true; token: string; expire: number; signature: string; publicKey: string; folder: string }

// ImageKit free plan caps; checked up front so the admin gets a clear message
const IK_MAX = { image: 25, video: 100 } // MB

async function uploadFile(file: File, onProgress: (p: number) => void) {
  const ikAuth = await api<IKAuth>('/admin/imagekit-auth')
  const fd = new FormData()
  let url = '/api/admin/upload'
  if (ikAuth.enabled) {
    const kind = file.type.startsWith('video/') ? 'video' : 'image'
    if (file.size > IK_MAX[kind] * 1024 * 1024) throw new Error(`Too big: ${kind}s can be up to ${IK_MAX[kind]} MB on the ImageKit free plan. Compress it first.`)
    url = 'https://upload.imagekit.io/api/v1/files/upload'
    fd.append('fileName', file.name.replace(/[^\w.-]+/g, '-'))
    fd.append('folder', ikAuth.folder)
    fd.append('useUniqueFileName', 'true')
    fd.append('publicKey', ikAuth.publicKey)
    fd.append('signature', ikAuth.signature)
    fd.append('expire', String(ikAuth.expire))
    fd.append('token', ikAuth.token)
  }
  fd.append('file', file)

  return new Promise<string>((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', url)
    if (!ikAuth.enabled) xhr.setRequestHeader('authorization', `Bearer ${auth.get()}`)
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress(e.loaded / e.total)
    xhr.onload = () => {
      const j = JSON.parse(xhr.responseText || '{}')
      if (xhr.status === 401 && !ikAuth.enabled) { auth.set(null); dispatchEvent(new Event('cd:logout')) }
      // ImageKit answers { url }, our server answers { data: { url } }
      const done = j.url || j.data?.url
      if (xhr.status < 300 && done) resolve(done)
      else reject(new Error(j.message || 'Upload failed'))
    }
    xhr.onerror = () => reject(new Error('Upload failed, check your connection'))
    xhr.send(fd)
  })
}

const isVideo = (u: string) => /\.(mp4|webm|mov)$/i.test(u)

function MediaInput({ value, accept, onChange }: { value: string; accept: string; onChange: (v: string) => void }) {
  const [prog, setProg] = useState<number | null>(null)
  const [err, setErr] = useState('')
  const input = useRef<HTMLInputElement>(null)
  const pick = async (f?: File) => {
    if (!f) return
    setErr(''); setProg(0)
    try { onChange(await uploadFile(f, setProg)) } catch (e) { setErr((e as Error).message) } finally { setProg(null) }
  }
  return (
    <div className="ad-media">
      <div className="ad-prev" onClick={() => input.current?.click()}>
        {value ? (isVideo(value) ? <video src={ik(value, 'w-640')} muted playsInline controls /> : <img src={ik(value, 'w-800')} alt="" />) : <span className="mono">No file</span>}
        {prog !== null && <div className="ad-prog"><i style={{ width: `${prog * 100}%` }} /><span className="mono">{Math.round(prog * 100)}%</span></div>}
      </div>
      <div className="ad-row">
        <button type="button" className="ad-btn" onClick={() => input.current?.click()} disabled={prog !== null}>{value ? 'Replace' : 'Upload'}</button>
        {value && <button type="button" className="ad-btn ghost" onClick={() => onChange('')}>Remove</button>}
      </div>
      {err && <p className="ad-err">{err}</p>}
      <input ref={input} type="file" accept={accept} hidden onChange={(e) => { pick(e.target.files?.[0]); e.target.value = '' }} />
    </div>
  )
}

function Editor({ res, item, onClose, onSaved }: { res: Resource; item: Item; onClose: () => void; onSaved: () => void }) {
  const [d, setD] = useState<Item>({ ...res.blank, ...item })
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const set = (k: string, v: unknown) => setD((x) => ({ ...x, [k]: v }))

  useEffect(() => {
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    addEventListener('keydown', esc)
    return () => removeEventListener('keydown', esc)
  }, [onClose])

  const save = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true); setErr('')
    // send only editable fields
    const body = Object.fromEntries(Object.keys(res.blank).map((k) => [k, d[k]]))
    try {
      await api(item._id ? `${res.path}/${item._id}` : res.path, { method: item._id ? 'PUT' : 'POST', body: JSON.stringify(body) })
      onSaved()
    } catch (e) { setErr((e as Error).message) } finally { setBusy(false) }
  }

  return (
    <div className="ad-drawer-wrap" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <form className="ad-drawer" onSubmit={save}>
        <header className="ad-drawer-head">
          <h2>{item._id ? `Edit ${res.noun}` : `New ${res.noun}`}</h2>
          <button type="button" className="ad-btn ghost" onClick={onClose}>Close</button>
        </header>
        <div className="ad-fields">
          {res.fields.map((f) => {
            const v = d[f.key]
            // fields with their own buttons can't sit inside a <label> (it forwards clicks)
            const Tag = f.type === 'media' || f.type === 'gallery' || f.type === 'results' ? 'div' : 'label'
            return (
              <Tag key={f.key} className={'ad-field f-' + f.type}>
                <span className="mono">{f.label}</span>
                {f.type === 'text' && <input value={String(v ?? '')} required={f.required} onChange={(e) => set(f.key, e.target.value)} />}
                {f.type === 'textarea' && <textarea rows={4} value={String(v ?? '')} onChange={(e) => set(f.key, e.target.value)} />}
                {f.type === 'color' && <div className="ad-row"><input type="color" value={String(v)} onChange={(e) => set(f.key, e.target.value)} /><code>{String(v)}</code></div>}
                {f.type === 'bool' && <input type="checkbox" className="ad-switch" checked={!!v} onChange={(e) => set(f.key, e.target.checked)} />}
                {f.type === 'list' && <input value={(v as string[]).join(', ')} onChange={(e) => set(f.key, e.target.value.split(',').map((s) => s.trim()).filter(Boolean))} />}
                {f.type === 'media' && <MediaInput value={String(v ?? '')} accept={f.accept} onChange={(u) => set(f.key, u)} />}
                {f.type === 'results' && (
                  <div className="ad-results">
                    {(v as { v: string; l: string }[]).map((r, k, arr) => (
                      <div className="ad-row" key={k}>
                        <input placeholder="+184%" value={r.v} onChange={(e) => set(f.key, arr.map((x, j) => (j === k ? { ...x, v: e.target.value } : x)))} />
                        <input placeholder="Conversion rate" value={r.l} onChange={(e) => set(f.key, arr.map((x, j) => (j === k ? { ...x, l: e.target.value } : x)))} />
                        <button type="button" className="ad-btn ghost" onClick={() => set(f.key, arr.filter((_, j) => j !== k))} aria-label="Remove result">x</button>
                      </div>
                    ))}
                    {(v as unknown[]).length < 6 && <button type="button" className="ad-btn ghost" onClick={() => set(f.key, [...(v as unknown[]), { v: '', l: '' }])}>Add result</button>}
                  </div>
                )}
                {f.type === 'gallery' && (
                  <div className="ad-gallery">
                    {(v as string[]).map((u, k, arr) => (
                      <MediaInput key={u + k} value={u} accept={IMG} onChange={(nu) => set(f.key, nu ? arr.map((x, j) => (j === k ? nu : x)) : arr.filter((_, j) => j !== k))} />
                    ))}
                    <MediaInput key={'new' + (v as string[]).length} value="" accept={IMG} onChange={(nu) => nu && set(f.key, [...(v as string[]), nu])} />
                  </div>
                )}
                {f.hint && <small>{f.hint}</small>}
              </Tag>
            )
          })}
        </div>
        <footer className="ad-drawer-foot">
          {err && <p className="ad-err">{err}</p>}
          <button type="button" className="ad-btn ghost" onClick={onClose}>Cancel</button>
          <button className="ad-btn primary" disabled={busy}>{busy ? 'Saving' : 'Save'}</button>
        </footer>
      </form>
    </div>
  )
}

function Manager({ res, toast }: { res: Resource; toast: (m: string) => void }) {
  const [items, setItems] = useState<Item[] | null>(null)
  const [edit, setEdit] = useState<Item | null>(null)
  const [arm, setArm] = useState<string | null>(null) // id armed for delete
  const [err, setErr] = useState('')
  const drag = useRef<number | null>(null)

  const load = useCallback(() => {
    api<Item[]>(res.path).then(setItems).catch((e) => setErr(e.message))
  }, [res.path])
  useEffect(() => { load() }, [load])

  const saveOrder = async (next: Item[]) => {
    setItems(next)
    try {
      await api(`${res.path}/order`, { method: 'PUT', body: JSON.stringify({ ids: next.map((i) => i._id) }) })
      clearCache(); toast('Order saved')
    } catch (e) { setErr((e as Error).message); load() }
  }
  const move = (from: number, to: number) => {
    if (!items || to < 0 || to >= items.length || from === to) return
    const next = [...items]
    next.splice(to, 0, next.splice(from, 1)[0])
    saveOrder(next)
  }
  const remove = async (i: Item) => {
    if (arm !== i._id) { setArm(i._id!); setTimeout(() => setArm((a) => (a === i._id ? null : a)), 3000); return }
    try { await api(`${res.path}/${i._id}`, { method: 'DELETE' }); clearCache(); toast(`Deleted ${res.name(i)}`); load() } catch (e) { setErr((e as Error).message) }
  }
  const togglePub = async (i: Item) => {
    const body = Object.fromEntries(Object.keys(res.blank).map((k) => [k, i[k]]))
    try { await api(`${res.path}/${i._id}`, { method: 'PUT', body: JSON.stringify({ ...body, published: !i.published }) }); clearCache(); load() } catch (e) { setErr((e as Error).message) }
  }

  return (
    <section className="ad-panel">
      <div className="ad-panel-head">
        <div>
          <h1>{res.title}</h1>
          <p className="mono">{items ? `${items.length} total, drag to reorder` : 'Loading'}</p>
        </div>
        <button className="ad-btn primary" onClick={() => setEdit({ ...res.blank })}>New {res.noun}</button>
      </div>
      {err && <p className="ad-err" onClick={() => setErr('')}>{err}</p>}
      {items && !items.length && <div className="ad-empty"><p>No {res.title.toLowerCase()} yet.</p><button className="ad-btn" onClick={() => setEdit({ ...res.blank })}>Add the first one</button></div>}
      <ol className="ad-list">
        {items?.map((i, k) => (
          <li
            key={i._id}
            draggable
            onDragStart={() => (drag.current = k)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => { if (drag.current !== null) move(drag.current, k); drag.current = null }}
            className={i.published ? '' : 'draft'}
          >
            <span className="ad-grip" aria-hidden>::</span>
            <span className="ad-thumb" style={{ background: String(i.tint || '#e9e8e2') }}>
              {res.thumb(i) && <img src={ik(res.thumb(i), 'w-200')} alt="" />}
            </span>
            <div className="ad-meta">
              <b>{res.name(i)}</b>
              <span className="mono">{res.sub(i)}</span>
              <span className="ad-badges">{res.badges(i).map((b) => <em key={b}>{b}</em>)}</span>
            </div>
            <div className="ad-actions">
              <button className="ad-btn ghost sq" onClick={() => move(k, k - 1)} disabled={k === 0} aria-label="Move up">Up</button>
              <button className="ad-btn ghost sq" onClick={() => move(k, k + 1)} disabled={k === items.length - 1} aria-label="Move down">Down</button>
              <button className="ad-btn ghost" onClick={() => togglePub(i)}>{i.published ? 'Unpublish' : 'Publish'}</button>
              <button className="ad-btn" onClick={() => setEdit(i)}>Edit</button>
              <button className={'ad-btn danger' + (arm === i._id ? ' armed' : '')} onClick={() => remove(i)}>{arm === i._id ? 'Sure?' : 'Delete'}</button>
            </div>
          </li>
        ))}
      </ol>
      {edit && <Editor res={res} item={edit} onClose={() => setEdit(null)} onSaved={() => { setEdit(null); clearCache(); toast('Saved'); load() }} />}
    </section>
  )
}

function Login({ onIn }: { onIn: () => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true); setErr('')
    try {
      const { token } = await api<{ token: string }>('/admin/login', { method: 'POST', body: JSON.stringify({ email, password }) })
      auth.set(token); onIn()
    } catch (e) { setErr((e as Error).message) } finally { setBusy(false) }
  }
  return (
    <main className="ad-login">
      <form onSubmit={submit}>
        <Logo />
        <h1>Admin</h1>
        <label className="ad-field"><span className="mono">Email</span><input type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
        <label className="ad-field"><span className="mono">Password</span><input type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required /></label>
        {err && <p className="ad-err">{err}</p>}
        <button className="ad-btn primary" disabled={busy}>{busy ? 'Checking' : 'Log in'}</button>
        <a href="/" className="mono ad-back">Back to site</a>
      </form>
    </main>
  )
}

export default function Admin() {
  const [token, setToken] = useState(auth.get())
  const [tab, setTab] = useState<'projects' | 'reviews'>('projects')
  const [msg, setMsg] = useState('')
  const timer = useRef(0)
  const toast = useCallback((m: string) => {
    setMsg(m); clearTimeout(timer.current); timer.current = window.setTimeout(() => setMsg(''), 2200)
  }, [])

  useEffect(() => {
    document.body.classList.add('admin-mode')
    const out = () => setToken(null)
    addEventListener('cd:logout', out)
    return () => { document.body.classList.remove('admin-mode'); removeEventListener('cd:logout', out) }
  }, [])

  if (!token) return <Login onIn={() => setToken(auth.get())} />

  return (
    <div className="ad">
      <header className="ad-top">
        <a href="/" className="logo"><Logo /></a>
        <nav className="ad-tabs">
          <button className={tab === 'projects' ? 'on' : ''} onClick={() => setTab('projects')}>Projects</button>
          <button className={tab === 'reviews' ? 'on' : ''} onClick={() => setTab('reviews')}>Reviews</button>
        </nav>
        <div className="ad-row">
          <a href="/" className="ad-btn ghost">View site</a>
          <button className="ad-btn ghost" onClick={() => { auth.set(null); setToken(null) }}>Log out</button>
        </div>
      </header>
      <Manager key={tab} res={tab === 'projects' ? PROJECTS : REVIEWS} toast={toast} />
      <div className={'ad-toast' + (msg ? ' on' : '')} role="status">{msg}</div>
    </div>
  )
}

