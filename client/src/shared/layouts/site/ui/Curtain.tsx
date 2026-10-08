import type { Ref } from 'react'
import { Mark } from '../../../components/brand/Logo'

/** Full screen panel that sweeps over the page between routes. */
export function Curtain({ ref }: { ref: Ref<HTMLDivElement> }) {
  return <div className="curtain" ref={ref} aria-hidden><Mark size={56} /></div>
}
