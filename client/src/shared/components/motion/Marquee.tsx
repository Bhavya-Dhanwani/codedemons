import type { ReactNode } from 'react'

/** Infinite CSS marquee; content is duplicated for a seamless loop. */
export function Marquee({ children, reverse = false }: { children: ReactNode; reverse?: boolean }) {
  return (
    <div className="marquee">
      <div className={'marquee-track' + (reverse ? ' rev' : '')}>
        <div>{children}</div>
        <div aria-hidden>{children}</div>
      </div>
    </div>
  )
}
