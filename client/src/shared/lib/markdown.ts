export type Block = { type: 'h2' | 'h3' | 'p'; text: string } | { type: 'ul'; items: string[] }

/** Tiny markdown: "# " title, "## " heading, "- " bullet, blank line between paragraphs. Rendered as React elements, never HTML. */
export function parseDoc(text: string): Block[] {
  const out: Block[] = []
  let list: string[] = []
  const flush = () => { if (list.length) out.push({ type: 'ul', items: list }); list = [] }
  for (const line of text.split('\n')) {
    const t = line.trim()
    if (t.startsWith('- ')) { list.push(t.slice(2)); continue }
    flush()
    if (!t) continue
    if (t.startsWith('## ')) out.push({ type: 'h3', text: t.slice(3) })
    else if (t.startsWith('# ')) out.push({ type: 'h2', text: t.slice(2) })
    else out.push({ type: 'p', text: t })
  }
  flush()
  return out
}
