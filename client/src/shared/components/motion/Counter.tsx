import { useCounter } from '../../hooks/useMotion'

/** Counts up to `to` when visible. */
export function Counter({ to, suffix = '' }: { to: number; suffix?: string }) {
  const ref = useCounter(to, suffix)
  return <span ref={ref}>0{suffix}</span>
}
