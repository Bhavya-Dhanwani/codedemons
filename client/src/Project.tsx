import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { Reveal, ScrubText } from './ui'
import { useProjects, ik, ikPoster } from './api'

export default function Project({ slug }: { slug: string }) {
  const all = useProjects()
  const ref = useRef<HTMLElement>(null)
  const i = all ? all.findIndex((p) => p.slug === slug) : -1
  const p = all?.[i]
  const next = all && p ? all[(i + 1) % all.length] : null

  useGSAP(() => {
    if (!p) return
    // cover opens from a framed card to full bleed while the image drifts
    gsap.fromTo('.pj-cover', { clipPath: 'inset(8% 10% 8% 10% round 28px)' }, {
      clipPath: 'inset(0% 0% 0% 0% round 0px)', ease: 'none',
      scrollTrigger: { trigger: '.pj-cover', start: 'top 85%', end: 'top top', scrub: true },
    })
    gsap.utils.toArray<HTMLElement>('.parallax > img, .parallax > video').forEach((im) => {
      gsap.fromTo(im, { yPercent: -8 }, { yPercent: 8, ease: 'none', scrollTrigger: { trigger: im.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } })
    })
    gsap.from('.pj-meta > div', { y: 30, opacity: 0, stagger: 0.08, duration: 1, ease: 'expo.out', delay: 0.4 })
    gsap.from('.pj-result', { y: 60, opacity: 0, stagger: 0.1, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: '.pj-results', start: 'top 80%' } })
    gsap.from('.pj-gallery > *', { y: 80, opacity: 0, stagger: 0.1, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: '.pj-gallery', start: 'top 80%' } })
    ScrollTrigger.refresh()
  }, { scope: ref, dependencies: [slug, !!p] })

  if (!all) return <main className="pj pj-msg"><p className="mono">Loading</p></main>
  if (!p) return (
    <main className="pj pj-msg">
      <h1 className="h2">This project went back into the dark.</h1>
      <a href="/work" className="pill-big">See all work</a>
    </main>
  )

  const meta = [['Client', p.client], ['Year', p.year], ['Type', p.kind], ['Services', p.services.join(', ')]].filter(([, v]) => v)
  const hero = p.video || p.cover

  return (
    <main className="pj" ref={ref} key={slug}>
      <header className="pj-head">
        <a href="/work" className="mono pj-back">All work</a>
        <span className="mono">Project {String(i + 1).padStart(2, '0')} / {String(all.length).padStart(2, '0')}</span>
        <Reveal as="h1" text={p.name} className="mega" />
        {p.intro && <p className="pj-intro">{p.intro}</p>}
        <div className="pj-meta">
          {meta.map(([k, v]) => <div key={k}><span className="mono">{k}</span><p>{v}</p></div>)}
          {p.liveUrl && <div><span className="mono">Live</span><p><a href={p.liveUrl} target="_blank" rel="noopener noreferrer" className="u">Visit site</a></p></div>}
        </div>
      </header>

      {hero && (
        <div className="pj-cover parallax" style={{ background: p.tint }}>
          {p.video
            ? <video src={ik(p.video, 'w-1920,ac-none')} poster={ik(p.cover, 'w-2000') || ikPoster(p.video, 2000) || undefined} autoPlay muted loop playsInline />
            : <img src={ik(p.cover, 'w-2400')} alt={`${p.name} website`} />}
        </div>
      )}

      {(p.challenge || p.solution) && (
        <section className="pj-story">
          {p.challenge && <div><span className="mono label">The challenge</span><p>{p.challenge}</p></div>}
          {p.solution && <div><span className="mono label">What we did</span><p>{p.solution}</p></div>}
        </section>
      )}

      <div className="pj-split">
        <div className="pj-tint" style={{ background: p.tint, color: isDark(p.tint) ? '#fff' : 'var(--ink)' }}>
          <em>{p.name}</em>
          <span className="mono">{[p.kind, p.year].filter(Boolean).join(', ')}</span>
        </div>
        {(p.detail || p.cover) && <div className="parallax"><img src={ik(p.detail || p.cover, 'w-1800')} alt={`${p.name} detail`} loading="lazy" /></div>}
      </div>

      {p.intro && (
        <section className="pj-quote">
          <ScrubText text={`"${p.intro}" That was the brief. Everything you see here exists to serve that one sentence.`} />
        </section>
      )}

      {p.gallery.length > 0 && (
        <div className="pj-gallery">
          {p.gallery.map((src, k) => <div className="parallax" key={k}><img src={ik(src, 'w-1800')} alt={`${p.name} gallery ${k + 1}`} loading="lazy" /></div>)}
        </div>
      )}

      {p.results.length > 0 && (
        <section className="pj-results">
          <span className="mono label">Results</span>
          <div className="pj-results-grid">
            {p.results.map((r) => <div className="pj-result" key={r.l}><b>{r.v}</b><span className="mono">{r.l}</span></div>)}
          </div>
        </section>
      )}

      {next && next !== p && (
        <a href={`/work/${next.slug}`} className="pj-next" data-cursor="Next">
          <span className="mono">Next project</span>
          <h2 className="mega">{next.name}</h2>
          {next.cover && <div className="pj-next-img"><img src={ik(next.cover, 'w-1600')} alt="" /></div>}
        </a>
      )}
    </main>
  )
}

/** Picks readable text over a tint. */
function isDark(hex: string) {
  const n = parseInt(hex.slice(1), 16)
  return ((n >> 16) * 299 + ((n >> 8) & 255) * 587 + (n & 255) * 114) / 1000 < 128
}
