export const pad = (n: number) => String(n).padStart(2, '0')
export const inr = (n: number) => '₹' + n.toLocaleString('en-IN', { maximumFractionDigits: 2 })
export const label = (s: string) => s[0].toUpperCase() + s.slice(1)
export const count = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`
export const plural = (n: number, word: string) => `${word}${n > 1 ? 's' : ''}`
export const firstName = (name: string) => name.split(' ')[0]
export const joinParts = (parts: unknown[], sep = ', ') => parts.filter(Boolean).join(sep)

export const day = (d?: string | null, month: 'short' | 'long' = 'short') =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month }) : ''

export const when = (d?: string | null) =>
  d ? new Date(d).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' }) : ''

export const ago = (d: string) => {
  const m = Math.round((Date.now() - new Date(d).getTime()) / 60000)
  return m < 60 ? `${Math.max(m, 1)}m ago` : m < 1440 ? `${Math.round(m / 60)}h ago` : day(d)
}

// local YYYY-MM-DD (toISOString is UTC, a day behind in IST before 5:30am)
export const isoDay = (d?: string | number | null) => (d ? new Date(d).toLocaleDateString('en-CA') : '')
export const plusDays = (n: number) => isoDay(Date.now() + n * 864e5)
export const endOfToday = () => new Date(new Date().setHours(23, 59, 59, 999)).getTime()

/** Picks readable text over a tint. */
export function isDark(hex: string) {
  const n = parseInt(hex.slice(1), 16)
  return ((n >> 16) * 299 + ((n >> 8) & 255) * 587 + (n & 255) * 114) / 1000 < 128
}
