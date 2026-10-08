/** Title that rolls to a second copy on hover. */
export function RollText({ text }: { text: string }) {
  return <span className="roll" aria-label={text}><span aria-hidden>{text}</span><span aria-hidden>{text}</span></span>
}
