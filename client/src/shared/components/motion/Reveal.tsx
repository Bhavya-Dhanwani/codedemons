import { Fragment } from 'react'
import { useReveal } from '../../hooks/useMotion'

type Props = { text: string; as?: 'h1' | 'h2' | 'h3' | 'p'; className?: string; delay?: number }

/** Words slide up out of a mask when scrolled into view. */
export function Reveal({ text, as: Tag = 'h2', className = '', delay = 0 }: Props) {
  const ref = useReveal<HTMLHeadingElement>(delay)
  return (
    <Tag ref={ref} className={className} aria-label={text}>
      {text.split(' ').map((w, i) => (
        <Fragment key={i}><span className="w" aria-hidden><span>{w}</span></span>{' '}</Fragment>
      ))}
    </Tag>
  )
}
