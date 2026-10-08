export type Project = {
  _id: string
  slug: string
  name: string
  kind: string
  year: string
  client: string
  services: string[]
  intro: string
  challenge: string
  solution: string
  results: { v: string; l: string }[]
  tint: string
  liveUrl: string
  cover: string
  detail: string
  gallery: string[]
  video: string
  featured: boolean
  published: boolean
  order: number
}

export type Review = {
  _id: string
  who: string
  company: string
  quote: string
  video: string
  poster: string
  published: boolean
  order: number
}

export type Sig = { name?: string; image?: string; at?: string | null }

export type DocFull = {
  _id: string; title: string; kind: string; body: string; status: 'draft' | 'sent' | 'signed'
  us?: Sig; them?: Sig; clientInfo?: { name: string; company?: string; email?: string }
}

export type Signature = { name: string; image: string }
