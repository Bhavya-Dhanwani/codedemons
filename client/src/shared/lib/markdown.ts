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

const esc = (s: string) => s.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]!)

/** The same blocks as escaped HTML, for the editable paper. */
export const toHtml = (text: string) =>
  parseDoc(text).map((b) => (b.type === 'ul' ? `<ul>${b.items.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>` : `<${b.type}>${esc(b.text)}</${b.type}>`)).join('') || '<p><br></p>'

const clean = (s: string) => s.replace(/\s+/g, ' ').trim()

/** Read the edited paper back into tiny markdown. Anything the browser invents (divs, spans, br) becomes paragraphs. */
export function fromDom(root: HTMLElement): string {
  const out: string[] = []
  for (const n of Array.from(root.childNodes)) {
    if (!(n instanceof HTMLElement)) { const t = clean(n.textContent || ''); if (t) out.push(t); continue }
    if (n.tagName === 'UL' || n.tagName === 'OL') {
      const items = Array.from(n.querySelectorAll('li'), (li) => clean(li.innerText)).filter(Boolean)
      if (items.length) out.push(items.map((i) => '- ' + i).join('\n'))
      continue
    }
    const lines = n.innerText.split('\n').map(clean).filter(Boolean)
    if (!lines.length) continue
    if (n.tagName === 'H1' || n.tagName === 'H2') out.push('# ' + lines.join(' '))
    else if (/^H[3-6]$/.test(n.tagName)) out.push('## ' + lines.join(' '))
    else out.push(...lines)
  }
  return out.join('\n\n')
}

/** AI output squeezed into the tiny format: no bold, deeper headings become headings, * bullets become - bullets. */
export const tidy = (md: string) => md
  .replace(/\*\*(.+?)\*\*/g, '$1')
  .replace(/__(.+?)__/g, '$1')
  .replace(/^#{3,6} /gm, '## ')
  .replace(/^\s*[*•] /gm, '- ')
  .replace(/^```.*$/gm, '')

export const words = (text: string) => text.split(/\s+/).filter((w) => w && !/^[#-]+$/.test(w)).length
