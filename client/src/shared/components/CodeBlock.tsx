import { useEffect, useState } from 'react'

/** Dark code box with a label (file or language) and a copy button that confirms in place. Comment lines are dimmed. */
export function CodeBlock({ label, code }: { label: string; code: string }) {
  const [copied, setCopied] = useState(false)
  useEffect(() => {
    if (!copied) return
    const t = setTimeout(() => setCopied(false), 1600)
    return () => clearTimeout(t)
  }, [copied])
  const copy = () => navigator.clipboard.writeText(code).then(() => setCopied(true), () => {})
  return (
    <div className="code">
      <div className="code-head">
        <span>{label}</span>
        <button type="button" onClick={copy} className={copied ? 'done' : ''}>{copied ? 'Copied ✓' : 'Copy'}</button>
      </div>
      <pre>
        {code.split('\n').map((line, i) => (
          <span key={i} className={/^\s*(\/\/|#)/.test(line) ? 'c' : ''}>{line || ' '}{'\n'}</span>
        ))}
      </pre>
    </div>
  )
}
