import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { when } from '../lib/format'
import { Button } from './Button'

export type Message = { _id: string; from: 'client' | 'studio'; text: string; at: string }

type Props = {
  messages: Message[]
  me: 'client' | 'studio'
  /** when the other side last opened the conversation */
  seenAt?: string | null
  onSend: (text: string) => Promise<boolean>
  empty: string
  them: string
}

/** The project conversation: bubbles, "Seen", Enter to send (Shift+Enter for a new line). */
export function Chat({ messages, me, seenAt, onSend, empty, them }: Props) {
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const list = useRef<HTMLOListElement>(null)
  useEffect(() => { list.current?.scrollTo({ top: list.current.scrollHeight }) }, [messages.length])

  const lastMine = messages.findLastIndex((m) => m.from === me)
  const seen = lastMine >= 0 && !!seenAt && new Date(seenAt) >= new Date(messages[lastMine].at)

  const send = async (e?: FormEvent) => {
    e?.preventDefault()
    if (!text.trim() || busy) return
    setBusy(true)
    if (await onSend(text.trim())) setText('')
    setBusy(false)
  }
  const key = (e: KeyboardEvent) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }

  return (
    <div className="chat">
      <ol className="chat-list" ref={list}>
        {!messages.length && <li className="chat-empty">{empty}</li>}
        {messages.map((m, i) => (
          <li key={m._id} className={m.from === me ? 'mine' : ''}>
            <p>{m.text}</p>
            <small>{m.from === me ? 'You' : them} · {when(m.at)}{i === lastMine && seen ? ' · Seen' : ''}</small>
          </li>
        ))}
      </ol>
      <form className="chat-box" onSubmit={send}>
        <textarea rows={2} value={text} onChange={(e) => setText(e.target.value)} onKeyDown={key} placeholder="Write a message" aria-label="Message" />
        <Button type="submit" variant="primary" disabled={!text.trim() || busy}>Send</Button>
      </form>
    </div>
  )
}
