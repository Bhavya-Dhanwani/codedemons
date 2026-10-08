import { useScrubText } from '../../hooks/useMotion'

/** Paragraph whose words light up as you scroll through it. */
export function ScrubText({ text }: { text: string }) {
  const ref = useScrubText<HTMLParagraphElement>()
  return (
    <p ref={ref} className="scrub">
      {text.split(' ').map((w, i) => <span key={i}>{w} </span>)}
    </p>
  )
}
