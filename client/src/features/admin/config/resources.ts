import { ikPoster } from '../../../shared/lib/media'

// One generic manager + editor serves both resources; these describe the differences.

export type Field =
  | { key: string; label: string; type: 'text' | 'textarea' | 'color' | 'bool' | 'list'; hint?: string; required?: boolean }
  | { key: string; label: string; type: 'media'; accept: string; hint?: string }
  | { key: string; label: string; type: 'gallery' | 'results'; hint?: string }

export type Item = { _id?: string; published?: boolean; order?: number; [k: string]: unknown }
export type Result = { v: string; l: string }

export type Resource = {
  path: '/admin/projects' | '/admin/reviews'
  /** query key of the public list to refresh after edits */
  publicKey: 'projects' | 'reviews'
  title: string
  noun: string
  blank: Item
  fields: Field[]
  thumb: (i: Item) => string
  name: (i: Item) => string
  sub: (i: Item) => string
  badges: (i: Item) => string[]
}

export const IMG = 'image/jpeg,image/png,image/webp,image/avif,image/gif'
const VID = 'video/mp4,video/webm,video/quicktime'

export const PROJECTS: Resource = {
  path: '/admin/projects', publicKey: 'projects', title: 'Projects', noun: 'project',
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

export const REVIEWS: Resource = {
  path: '/admin/reviews', publicKey: 'reviews', title: 'Reviews', noun: 'review',
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

/** Only the editable fields go to the server. */
export const bodyOf = (res: Resource, i: Item) => Object.fromEntries(Object.keys(res.blank).map((k) => [k, i[k]]))

/** Fields with their own buttons can't sit inside a <label> (it forwards clicks). */
export const hasButtons = (f: Field) => f.type === 'media' || f.type === 'gallery' || f.type === 'results'
