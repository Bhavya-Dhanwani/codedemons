import { Mark } from '../../../shared/components/brand/Logo'

type Props = { code?: string; title: string; action?: { href: string; label: string } }

/** Big "4(demon)4" with a message and a way out. Also used for a missing project. */
export function NotFoundView({ code = '404', title, action = { href: '/', label: 'Back to home' } }: Props) {
  const [first, , last] = code
  return (
    <main className="pj-msg nf">
      <p className="nf-code" aria-label={code}>{first}<Mark size={120} />{last}</p>
      <h1 className="h2">{title}</h1>
      <a href={action.href} className="pill-big" data-cursor="hidden">{action.label}</a>
    </main>
  )
}
