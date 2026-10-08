// Form rules for instant feedback. They mirror the server's zod schemas, which stay the real gate.
// A rule returns the error message, or undefined when the value is fine.

export type Rule = (v: string) => string | undefined

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const NAME = /^[\p{L}\p{M}][\p{L}\p{M} .'-]*$/u
const PHONE = /^\+?[\d\s()-]+$/
const digits = (v: string) => v.replace(/\D/g, '').length

export const required = (msg: string): Rule => (v) => (v.trim() ? undefined : msg)

export const email: Rule = (v) => {
  const t = v.trim()
  if (!t) return 'Enter your email'
  if (t.length > 200) return 'Email is too long'
  if (!EMAIL.test(t)) return "That email doesn't look right"
}

export const name: Rule = (v) => {
  const t = v.trim()
  if (!t) return 'Please tell us your name'
  if (t.length < 2) return 'Name is too short'
  if (t.length > 100) return 'Name is too long'
  if (!NAME.test(t)) return "Use letters in your name (spaces, . ' - are fine)"
}

export const optionalText = (max: number, what: string): Rule => (v) => (v.trim().length > max ? `${what} is too long` : undefined)

export const optionalPhone: Rule = (v) => {
  const t = v.trim()
  if (!t) return
  if (t.length > 20 || !PHONE.test(t) || digits(t) < 7 || digits(t) > 15) return "That phone number doesn't look right"
}

export const otp: Rule = (v) => (/^\d{6}$/.test(v) ? undefined : 'The code is 6 digits')
