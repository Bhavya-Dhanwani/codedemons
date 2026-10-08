import axios, { type AxiosError, type AxiosRequestConfig } from 'axios'

/** Every server answer is wrapped like this. */
type Envelope<T> = { success: boolean; message: string; data: T }

export type Scope = 'admin' | 'portal'

// The store is plugged in at startup (app/store.ts) so this file doesn't import it.
let tokenOf: (s: Scope) => string | null = () => null
let onExpired: (s: Scope) => void = () => {}
export const connectAuth = (get: typeof tokenOf, expired: typeof onExpired) => { tokenOf = get; onExpired = expired }

/** /admin/* calls carry the admin token, /portal/* calls the client token. */
const scopeOf = (url = ''): Scope | null => (url.startsWith('/admin') ? 'admin' : url.startsWith('/portal') ? 'portal' : null)
// a 401 from these means "wrong credentials", not "session expired"
const AUTH_CALLS = /\/(login|code|signup)$/

export const http = axios.create({ baseURL: '/api' })

http.interceptors.request.use((config) => {
  const scope = scopeOf(config.url)
  const token = scope && tokenOf(scope)
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

http.interceptors.response.use(
  (res) => {
    const body = res.data as Envelope<unknown> | undefined
    return body?.success ? res : Promise.reject(new Error(body?.message || 'Request failed'))
  },
  (err: AxiosError<Envelope<unknown>>) => {
    const url = err.config?.url ?? ''
    const scope = scopeOf(url)
    if (err.response?.status === 401 && scope && !AUTH_CALLS.test(url)) onExpired(scope)
    const fallback = err.response ? `Request failed (${err.response.status})` : 'Network error, check your connection'
    return Promise.reject(new Error(err.response?.data?.message || fallback))
  },
)

const unwrap = <T>(p: Promise<{ data: Envelope<T> }>) => p.then((r) => r.data.data)

/** JSON in, the envelope's `data` out; throws an Error with the server's message. */
export const api = {
  get: <T>(url: string, params?: object) => unwrap<T>(http.get(url, { params })),
  post: <T = null>(url: string, body?: unknown, config?: AxiosRequestConfig) => unwrap<T>(http.post(url, body, config)),
  put: <T = null>(url: string, body?: unknown) => unwrap<T>(http.put(url, body)),
  del: <T = null>(url: string) => unwrap<T>(http.delete(url)),
}
