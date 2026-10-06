import { Component, lazy, Suspense, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { Reveal, Magnetic, workIntro, inSpinZone } from './ui'
import { useProjects, ik, ikPoster, type Project } from './api'

const Work3D = lazy(() => import('./Work3D'))

const pad = (n: number) => String(n).padStart(2, '0')

/** Image that rolls in with a clip reveal; plays the project video on hover when there is one. */
function Media({ p, src }: { p: Project; src?: string }) {
  const v = useRef<HTMLVideoElement>(null)
  return (
    <div
      className="media"
      style={{ background: p.tint }}
      onPointerEnter={() => v.current?.play().catch(() => {})}
      onPointerLeave={() => v.current?.pause()}
    >
      {(src || p.cover || p.video) && <img src={ik(src || p.cover, 'w-1400') || ikPoster(p.video, 1400)} alt={`${p.name} preview`} loading="lazy" />}
      {p.video && <video ref={v} src={ik(p.video, 'w-1280,ac-none')} muted loop playsInline preload="none" />}
    </div>
  )
}

/** Title that rolls to a second copy on hover. */
const Roll = ({ text }: { text: string }) => (
  <span className="roll" aria-label={text}><span aria-hidden>{text}</span><span aria-hidden>{text}</span></span>
)

/** Home: the 4 most famous projects floating as a cloud on a sphere, then a link to everything. */
export function FeaturedWork() {
  const all = useProjects()
  const ref = useRef<HTMLElement>(null)
  const [hover, setHover] = useState<string | null>(null)
  const list = useMemo(() => {
    if (!all) return []
    const f = all.filter((p) => p.featured)
    return (f.length ? f : all).slice(0, 4)
  }, [all])
  const p = list.find((x) => x.slug === hover)
  const [inZone, setInZone] = useState(false)
  const cloud = useRef<HTMLDivElement>(null)
  const pointer = useRef<{ x: number; y: number } | null>(null)

  useGSAP(() => {
    // the entrance is scrubbed by scroll while the section rises into view: it completes as the
    // section reaches the middle of the screen and reverses on the way back. No pin, nothing fights the scroll.
    ScrollTrigger.create({
      trigger: cloud.current, start: 'top bottom', end: 'center center',
      onUpdate: (s) => (workIntro.p = s.progress),
      onLeave: () => (workIntro.p = 1),
      onLeaveBack: () => (workIntro.p = 0),
    })
  }, { scope: ref })

  // the spin zone depends on scroll position too, so re-check it while the page scrolls
  useEffect(() => {
    const check = () => pointer.current && cloud.current && setInZone(inSpinZone(cloud.current, pointer.current.x, pointer.current.y))
    addEventListener('scroll', check, { passive: true })
    return () => removeEventListener('scroll', check)
  }, [])

  return (
    <section className="featured" id="work" ref={ref}>
      <div
        ref={cloud}
        className={'cloud' + (inZone ? ' zone' : '')}
        data-cursor={hover ? 'Open' : inZone ? 'Spin' : undefined}
        onPointerMove={(e) => { pointer.current = { x: e.clientX, y: e.clientY }; setInZone(inSpinZone(e.currentTarget, e.clientX, e.clientY)) }}
        onPointerLeave={() => { pointer.current = null; setInZone(false) }}
      >
        <div className="cloud-ring" aria-hidden />
        <div className="cloud-head">
          <span className="mono label">04 / Selected work</span>
          <span className="mono label">Scroll or drag the circle to spin</span>
        </div>
        {list.length > 0 && <Safe><Suspense fallback={null}><Work3D projects={list} onHover={setHover} /></Suspense></Safe>}
        <div className={'cloud-title' + (p ? ' on' : '')} aria-live="polite">
          <h2>{p ? p.name : 'Work that gets remembered.'}</h2>
          <span className="mono">{p ? [p.kind, p.year].filter(Boolean).join(', ') : `${list.length} favourites from the archive`}</span>
        </div>
      </div>
      {all && (
        <div className="feat-more">
          <Magnetic><a href="/work" className="pill-big" data-cursor="hidden">See all work <sup>{pad(all.length)}</sup></a></Magnetic>
        </div>
      )}
    </section>
  )
}

/** Keeps the page alive if the 3D cloud fails (no WebGL, missing image). */
class Safe extends Component<{ children: ReactNode }, { err: boolean }> {
  state = { err: false }
  static getDerivedStateFromError() { return { err: true } }
  render() { return this.state.err ? null : this.props.children }
}

/** Index list; a preview image chases the cursor. */
export function WorkIndex({ list }: { list: Project[] }) {
  const prev = useRef<HTMLDivElement>(null)
  const [cur, setCur] = useState<number | null>(null)
  useEffect(() => {
    const x = gsap.quickTo(prev.current, 'x', { duration: 0.6, ease: 'power3' })
    const y = gsap.quickTo(prev.current, 'y', { duration: 0.6, ease: 'power3' })
    const move = (e: PointerEvent) => { x(e.clientX); y(e.clientY) }
    addEventListener('pointermove', move)
    return () => removeEventListener('pointermove', move)
  }, [])
  useEffect(() => { gsap.to(prev.current, { scale: cur === null ? 0 : 1, duration: 0.5, ease: 'expo.out' }) }, [cur])
  return (
    <div className="index" onPointerLeave={() => setCur(null)}>
      <ul className="index-list">
        {list.map((p, i) => (
          <li key={p._id} onPointerMove={() => setCur(i)}>
            <a href={`/work/${p.slug}`} data-cursor="View">
              <span className="mono">{pad(i + 1)}</span>
              <h3>{p.name}</h3>
              <span className="mono">{p.kind}</span>
              <span className="mono">{p.year}</span>
            </a>
          </li>
        ))}
      </ul>
      <div className="index-prev" ref={prev} aria-hidden>
        <div className="index-strip" style={{ transform: `translateY(${-(cur ?? 0) * 100}%)` }}>
          {list.map((p) => <div key={p._id} style={{ background: p.tint }}>{p.cover && <img src={ik(p.cover, 'w-700')} alt="" />}</div>)}
        </div>
      </div>
    </div>
  )
}

function ReelCard({ p, n, src, dup }: { p: Project; n: number; src: string; dup?: boolean }) {
  return (
    <a className="rcard" href={`/work/${p.slug}`} data-cursor="View" tabIndex={dup ? -1 : undefined}>
      <Media p={p} src={src} />
      <div className="wcard-info">
        <h3><Roll text={p.name} /></h3>
        <span className="mono">{pad(n)} / {[p.kind, p.year].filter(Boolean).join(', ')}</span>
      </div>
    </a>
  )
}

/** /work: every project, filterable, as two opposing reels or a list. */
export default function WorkPage() {
  const all = useProjects()
  const ref = useRef<HTMLElement>(null)
  const [filter, setFilter] = useState('All')
  const [view, setView] = useState<'grid' | 'list'>('grid')

  const kinds = useMemo(() => ['All', ...new Set((all ?? []).map((p) => p.kind).filter(Boolean))], [all])
  const list = useMemo(() => (all ?? []).filter((p) => filter === 'All' || p.kind === filter), [all, filter])

  useGSAP(() => {
    gsap.from('.wp-head > .mono, .wp-bar', { y: 30, opacity: 0, stagger: 0.08, duration: 1, ease: 'expo.out', delay: 0.3 })
  }, { scope: ref })

  useGSAP(() => {
    if (view !== 'grid' || !list.length) return
    const mm = gsap.matchMedia()

    // desktop: two reels pinned side by side, travelling in opposite directions
    mm.add('(min-width: 801px)', () => {
      const L = ref.current!.querySelector<HTMLElement>('.reel-l')!
      const R = ref.current!.querySelector<HTMLElement>('.reel-r')!
      const travel = (el: HTMLElement) => Math.max(0, el.scrollHeight - innerHeight)
      // scroll speed tilts the reels; quickTo eases toward the target, so the tilt is damped
      const skewL = gsap.quickTo(L, 'skewY', { duration: 0.6, ease: 'power3' })
      const skewR = gsap.quickTo(R, 'skewY', { duration: 0.6, ease: 'power3' })
      const rail = ref.current!.querySelector<HTMLElement>('.reel-rail i')!
      const settle = () => { skewL(0); skewR(0) }

      gsap.timeline({
        scrollTrigger: {
          trigger: '.reels', start: 'top top', end: () => '+=' + Math.max(travel(L), travel(R), innerHeight * 0.5),
          pin: true, scrub: 0.8, invalidateOnRefresh: true,
          onUpdate: (s) => {
            const tilt = gsap.utils.clamp(-5, 5, s.getVelocity() / 450)
            skewL(-tilt); skewR(tilt) // opposite reels lean opposite ways
            rail.style.transform = `scaleY(${s.progress})`
          },
        },
      })
        .fromTo(L, { y: 0 }, { y: () => -travel(L), ease: 'none' }, 0)
        .fromTo(R, { y: () => -travel(R) }, { y: 0, ease: 'none' }, 0)

      ScrollTrigger.addEventListener('scrollEnd', settle)
      gsap.from('.rcard', { opacity: 0, y: 80, stagger: 0.06, duration: 1.1, ease: 'expo.out', delay: 0.2 })
      return () => ScrollTrigger.removeEventListener('scrollEnd', settle)
    })

    // phones: one reel, cards reveal as they scroll in
    mm.add('(max-width: 800px)', () => {
      const cards = gsap.utils.toArray<HTMLElement>('.reel-l .rcard')
      const reveal = (els: Element[]) => gsap.to(els, { clipPath: 'inset(0% 0% 0% 0%)', y: 0, duration: 1.1, ease: 'expo.out', stagger: 0.1 })
      gsap.set(cards, { clipPath: 'inset(100% 0% 0% 0%)', y: 50 })
      const onScreen = cards.filter((c) => c.getBoundingClientRect().top < innerHeight * 0.92)
      reveal(onScreen)
      const later = cards.filter((c) => !onScreen.includes(c))
      if (later.length) ScrollTrigger.batch(later, { start: 'top 92%', once: true, onEnter: reveal })
    })

    ScrollTrigger.refresh()
    return () => mm.revert()
  }, { scope: ref, dependencies: [all?.length, view, filter], revertOnUpdate: true })

  return (
    <main className="wp" ref={ref}>
      <header className="wp-head">
        <span className="mono label">Index of everything</span>
        <div className="wp-title">
          <Reveal as="h1" text="All work" className="mega" />
          {all && <sup className="mono">({pad(all.length)})</sup>}
        </div>
        <div className="wp-bar">
          <div className="chips" role="tablist" aria-label="Filter by type">
            {kinds.map((k) => (
              <button key={k} role="tab" aria-selected={filter === k} className={'chip' + (filter === k ? ' on' : '')} onClick={() => setFilter(k)}>{k}</button>
            ))}
          </div>
          <div className="chips" aria-label="View">
            {(['grid', 'list'] as const).map((v) => (
              <button key={v} className={'chip' + (view === v ? ' on' : '')} onClick={() => setView(v)} aria-pressed={view === v}>{v}</button>
            ))}
          </div>
        </div>
      </header>

      {!all && <p className="wp-empty mono">Loading the archive</p>}
      {all && !list.length && <p className="wp-empty mono">Nothing here yet</p>}

      {view === 'grid' ? (
        // wrapper div keeps React's DOM intact when GSAP inserts the pin-spacer
        <div key={filter}>
          <div className="reels">
            <div className="reel reel-l">
              {list.map((p, i) => <ReelCard key={p._id} p={p} n={i + 1} src={p.cover} />)}
            </div>
            <div className="reel-rail" aria-hidden><i /></div>
            {/* the second reel shows each project's detail shot, in reverse order */}
            <div className="reel reel-r" aria-hidden>
              {[...list].reverse().map((p) => <ReelCard key={p._id} p={p} n={list.indexOf(p) + 1} src={p.detail || p.cover} dup />)}
            </div>
          </div>
        </div>
      ) : (
        <WorkIndex list={list} />
      )}

      <section className="wp-cta">
        <span className="mono label">Your turn</span>
        <a href="/#contact" className="mega accent-line wp-cta-link" data-cursor="Talk">Yours next?</a>
      </section>
    </main>
  )
}
