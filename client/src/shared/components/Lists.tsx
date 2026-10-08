import type { ReactNode } from 'react'

type Entry = { _id: string; text: string; at: string }

/** Timeline of notes / updates. */
export function Feed({ items, time }: { items: Entry[]; time: (at: string) => string }) {
  return <ul className="crm-feed">{items.map((u) => <li key={u._id}><p>{u.text}</p><small>{time(u.at)}</small></li>)}</ul>
}

export function RowList({ children }: { children: ReactNode }) {
  return <ul className="crm-rows">{children}</ul>
}

/** Clickable row inside a RowList. */
export function RowButton({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return <li><button type="button" onClick={onClick}>{children}</button></li>
}

/** Coloured status pill, e.g. kind "d" + status "signed" gives the class "stage d-signed". */
export function Status({ kind, status, children }: { kind: string; status: string; children: ReactNode }) {
  return <span className={`stage ${kind}-${status}`}>{children}</span>
}
