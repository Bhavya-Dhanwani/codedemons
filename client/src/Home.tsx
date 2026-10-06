import { Component, lazy, Suspense, useEffect, useRef, useState, type ReactNode } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { Reveal, ScrubText, Magnetic, Counter, Marquee, heroScroll, peekScroll } from './ui'
import { Mark } from './Logo'
import { EMAIL, SERVICES, FOUNDERS, PROCESS, FAQ } from './data'
import { api, useReviews, ik, ikPoster, type Review } from './api'
import { FeaturedWork } from './Work'

const Scene = lazy(() => import('./Scene'))

/** Keeps the page alive if a 3D scene fails (e.g. no WebGL). */
class Safe extends Component<{ children: ReactNode }, { err: boolean }> {
  state = { err: false }
  static getDerivedStateFromError() { return { err: true } }
  render() { return this.state.err ? null : this.props.children }
}

const Label = ({ n, t }: { n: string; t: string }) => <span className="mono label">{n} / {t}</span>

function Hero({ ready }: { ready: boolean }) {
  const ref = useRef<HTMLElement>(null)
  useGSAP(() => {
    ScrollTrigger.create({ trigger: ref.current, start: 'top top', end: 'bottom top', onUpdate: (s) => (heroScroll.p = s.progress) })
    gsap.to('.hero-title', { yPercent: 35, ease: 'none', scrollTrigger: { trigger: ref.current, start: 'top top', end: 'bottom top', scrub: true } })
  }, { scope: ref })
  return (
    <section className="hero" ref={ref}>
      <div className="hero-canvas"><Safe><Suspense fallback={null}><Scene /></Suspense></Safe></div>
      <div className="hero-meta mono">
        <span>Digital studio</span>
        <span>Design / Development / Motion</span>
        <span>Est. 2026, India</span>
      </div>
      <div className="hero-title">
        {ready && <>
          <Reveal as="h1" text="Possessed" className="display" />
          <Reveal as="h1" text="by craft." className="display accent-line" delay={0.15} />
        </>}
      </div>
      <div className="hero-foot">
        <p>We are <b>codedemons</b>, a two person studio that designs and builds websites people cannot stop scrolling.</p>
        <span className="mono hint">Psst. Click the demons.</span>
      </div>
    </section>
  )
}

/** Dark room; the cursor is a torch. The motto hides in the dark, shy demons blink back. */
function Torch() {
  const ref = useRef<HTMLElement>(null)
  useEffect(() => {
    const el = ref.current!
    const IDLE_MS = 3000 // mouse still this long: the torch goes back to wandering on its own
    let hover = false, lastMove = 0, tx = 0.5, ty = 0.5, cx = 0.5, cy = 0.5
    const set = (px: number, py: number) => {
      el.style.setProperty('--x', px * 100 + '%')
      el.style.setProperty('--y', py * 100 + '%')
      el.querySelectorAll<HTMLElement>('.peeper').forEach((p) => {
        const dx = parseFloat(p.style.left) / 100 - px, dy = parseFloat(p.style.top) / 100 - py
        p.classList.toggle('shy', Math.hypot(dx * 1.6, dy) < 0.16)
      })
    }
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      hover = true; lastMove = performance.now()
      tx = (e.clientX - r.left) / r.width; ty = (e.clientY - r.top) / r.height
    }
    const leave = () => (hover = false)
    // the torch follows the mouse; when nobody holds it (pointer away, or still for IDLE_MS) it wanders on its own.
    // It always eases toward its target, so handing over between the two glides instead of jumping.
    const tick = (t: number, dt: number) => {
      const idle = !hover || performance.now() - lastMove > IDLE_MS
      if (idle) { tx = 0.5 + Math.sin(t * 0.6) * 0.32; ty = 0.5 + Math.sin(t * 1.1) * 0.22 }
      // tight follow while the mouse holds it, a slower glide when handing over to the wander path
      const k = 1 - Math.exp(-dt / (idle ? 400 : 50))
      cx += (tx - cx) * k; cy += (ty - cy) * k
      set(cx, cy)
    }
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerleave', leave)
    gsap.ticker.add(tick)
    return () => { el.removeEventListener('pointermove', move); el.removeEventListener('pointerleave', leave); gsap.ticker.remove(tick) }
  }, [])
  const peepers = [[12, 22], [84, 18], [70, 78], [22, 74], [52, 12], [92, 56], [6, 50], [40, 88]]
  const motto = (
    <h2 className="torch-text">
      <span>From not worthy</span>
      <em>to noteworthy.</em>
    </h2>
  )
  return (
    <section className="torch" ref={ref} data-cursor="hidden">
      <div className="torch-top">
        <Label n="02" t="In the dark" />
        <p>Somewhere out there, your brand is lost in the dark. We are the ones who find it.</p>
      </div>
      <div className="torch-dim" aria-hidden>{motto}</div>
      <div className="torch-lit">{motto}</div>
      <div className="torch-glow" aria-hidden />
      {peepers.map(([l, t], i) => (
        <div key={i} className="peeper" style={{ left: l + '%', top: t + '%', animationDelay: `${i * 0.7}s` }} aria-hidden><i /><i /></div>
      ))}
      <span className="mono torch-hint">Move your torch</span>
    </section>
  )
}

function Services() {
  const ref = useRef<HTMLElement>(null)
  useGSAP(() => {
    // each card sinks back as the next one stacks over it
    gsap.utils.toArray<HTMLElement>('.svc').slice(0, -1).forEach((card) => {
      gsap.to(card, { scale: 0.93, ease: 'none', scrollTrigger: { trigger: card, start: 'top 15%', end: 'bottom 15%', scrub: true } })
    })
  }, { scope: ref })
  return (
    <section className="services" id="services" ref={ref}>
      <div className="section-head">
        <Label n="03" t="What we do" />
        <Reveal text="Four crafts. One obsession." className="h2" />
      </div>
      <div className="stack">
        {SERVICES.map((s, i) => (
          <article className="svc" key={s.n} style={{ top: `calc(12vh + ${i * 28}px)` }}>
            <div className="svc-top mono"><span>{s.n}</span><span>{s.t}</span></div>
            <h3>{s.h}</h3>
            <p>{s.d}</p>
            <ul>{s.tags.map((t) => <li key={t}>{t}</li>)}</ul>
          </article>
        ))}
      </div>
    </section>
  )
}

function Founders() {
  return (
    <section className="founders" id="about">
      <div className="section-head">
        <Label n="05" t="The demons" />
        <Reveal text="Two founders. Zero middlemen." className="h2" />
        <p className="lead">You talk directly to the people designing and coding your product. No account managers, no hand offs, nothing lost in translation.</p>
      </div>
      <div className="founder-grid">
        {FOUNDERS.map((f) => (
          <Tilt key={f.name} href={f.url}>
            <div className="founder-art">
              <img src={f.img} alt={f.name} loading="lazy" />
            </div>
            <div className="founder-info">
              <h3>{f.name}</h3>
              <span className="mono">{f.role}</span>
              <p>{f.line}</p>
            </div>
          </Tilt>
        ))}
      </div>
    </section>
  )
}

function Tilt({ children, href }: { children: React.ReactNode; href: string }) {
  const ref = useRef<HTMLAnchorElement>(null)
  const move = (e: React.MouseEvent) => {
    const r = ref.current!.getBoundingClientRect()
    gsap.to(ref.current, { rotateY: ((e.clientX - r.left) / r.width - 0.5) * 12, rotateX: -((e.clientY - r.top) / r.height - 0.5) * 12, duration: 0.5 })
  }
  const leave = () => gsap.to(ref.current, { rotateX: 0, rotateY: 0, duration: 0.8, ease: 'elastic.out(1,0.4)' })
  return <a className="founder" href={href} target="_blank" rel="noopener" data-cursor="Visit" ref={ref} onMouseMove={move} onMouseLeave={leave}>{children}</a>
}

function VideoCard({ r }: { r: Review }) {
  const v = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(false)
  const toggle = () => {
    if (!r.video) return
    if (v.current!.paused) { v.current!.play(); setPlaying(true) } else { v.current!.pause(); setPlaying(false) }
  }
  return (
    <figure className="review" onClick={toggle} data-cursor={r.video ? (playing ? 'Pause' : 'Play') : undefined}>
      {r.video && <video ref={v} src={ik(r.video, 'w-1280')} poster={ik(r.poster, 'w-1000') || ikPoster(r.video, 1000) || undefined} playsInline preload="metadata" onEnded={() => setPlaying(false)} />}
      {!playing && (
        <div className="review-overlay">
          {r.video && <span className="play">Play</span>}
          {r.quote && <blockquote>"{r.quote}"</blockquote>}
        </div>
      )}
      <figcaption><b>{r.who}</b><span className="mono">{r.company}</span></figcaption>
    </figure>
  )
}

function Reviews() {
  const reviews = useReviews()
  if (!reviews?.length) return null
  return (
    <section className="reviews" id="reviews">
      <div className="section-head">
        <Label n="06" t="Kind words" />
        <Reveal text="Don't take our word for it." className="h2" />
      </div>
      <div className="review-grid">{reviews.map((r) => <VideoCard key={r._id} r={r} />)}</div>
    </section>
  )
}

function Process() {
  const ref = useRef<HTMLElement>(null)
  useGSAP(() => {
    gsap.from('.step', { y: 80, opacity: 0, stagger: 0.12, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: '.steps', start: 'top 80%' } })
    gsap.fromTo('.steps-line i', { scaleX: 0 }, { scaleX: 1, ease: 'none', scrollTrigger: { trigger: '.steps', start: 'top 75%', end: 'bottom 50%', scrub: true } })
  }, { scope: ref })
  return (
    <section className="process" ref={ref}>
      <div className="section-head">
        <Label n="07" t="How we work" />
        <Reveal text="Four D's. Zero drama." className="h2" />
      </div>
      <div className="steps-line"><i /></div>
      <div className="steps">
        {PROCESS.map((p, i) => (
          <div className="step" key={p.n}>
            <span className="mono">0{i + 1}</span>
            <h3>{p.n}</h3>
            <p>{p.d}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function Faq() {
  const [open, setOpen] = useState<number | null>(0)
  return (
    <section className="faq" id="faq">
      <div className="section-head center">
        <Label n="08" t="FAQ" />
        <Reveal text="Questions, answered." className="h2" />
      </div>
      <div className="faq-list">
        {FAQ.map((f, i) => (
          <div className={'faq-item' + (open === i ? ' open' : '')} key={i}>
            <button onClick={() => setOpen(open === i ? null : i)} aria-expanded={open === i}>
              <span>{f.q}</span><i className="plus" />
            </button>
            <div className="faq-a"><div><p>{f.a}</p></div></div>
          </div>
        ))}
      </div>
    </section>
  )
}

function ContactForm() {
  const [picked, setPicked] = useState<string[]>([])
  const [state, setState] = useState<'idle' | 'sending' | 'sent'>('idle')
  const [error, setError] = useState('')
  const toggle = (t: string) => setPicked((p) => (p.includes(t) ? p.filter((x) => x !== t) : [...p, t]))

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const f = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>
    setState('sending'); setError('')
    try {
      await api('/contact', { method: 'POST', body: JSON.stringify({ ...f, services: picked }) })
      setState('sent')
    } catch (err) {
      setError((err as Error).message); setState('idle')
    }
  }

  if (state === 'sent') return (
    <div className="cf-done" role="status">
      <span className="accent-line">Summoned.</span>
      <p>Your message is with both founders. Check your inbox, we'll reply within 24 hours.</p>
    </div>
  )

  return (
    <form className="cf" onSubmit={submit}>
      <label><span className="mono">Your name</span><input name="name" required minLength={2} maxLength={100} autoComplete="name" placeholder="Jane Doe" /></label>
      <label><span className="mono">Email</span><input name="email" type="email" required maxLength={200} autoComplete="email" placeholder="jane@company.com" /></label>
      <label className="cf-wide"><span className="mono">Company <i>(optional)</i></span><input name="company" maxLength={120} autoComplete="organization" placeholder="Acme Inc." /></label>
      <fieldset className="cf-wide">
        <legend className="mono">I need help with</legend>
        <div className="cf-chips">
          {SERVICES.map((s) => (
            <button type="button" key={s.t} aria-pressed={picked.includes(s.t)} onClick={() => toggle(s.t)}>{s.t}</button>
          ))}
        </div>
      </fieldset>
      <label className="cf-wide"><span className="mono">Tell us about it</span><textarea name="message" required minLength={10} maxLength={4000} rows={4} placeholder="What are you building, and when do you need it?" /></label>
      <input name="website" className="cf-hp" tabIndex={-1} autoComplete="off" aria-hidden="true" />
      <div className="cf-wide cf-foot">
        <p className="cf-err" role="alert">{error}</p>
        <Magnetic><button className="cta-btn" disabled={state === 'sending'} data-cursor="hidden">{state === 'sending' ? 'Sending…' : 'Send it'}</button></Magnetic>
      </div>
    </form>
  )
}

function Cta() {
  const ref = useRef<HTMLElement>(null)
  useGSAP(() => {
    ScrollTrigger.create({ trigger: ref.current, start: 'top bottom', end: 'center center', onUpdate: (s) => (peekScroll.p = s.progress) })
  }, { scope: ref })
  return (
    <section className="cta" id="contact" ref={ref}>
      <Label n="09" t="Let's talk" />
      <Reveal text="Ready when you are." className="h2 cta-small" />
      <Reveal text="Summon us." className="mega accent-line" delay={0.1} />
      <ContactForm />
      <p className="mono">or write to <a href={`mailto:${EMAIL}`}>{EMAIL}</a></p>
      <div className="cta-peek"><Safe><Suspense fallback={null}><Scene peek /></Suspense></Safe></div>
    </section>
  )
}

export default function Home({ ready }: { ready: boolean }) {
  const words = ['Websites', 'Web apps', '3D & Motion', 'Branding', 'E-commerce', 'SEO', 'Design systems']
  return (
    <main>
      <Hero ready={ready} />
      <Marquee>
        {words.map((t) => <span key={t} className="mq-item">{t}<Mark size={30} /></span>)}
      </Marquee>
      <section className="manifesto">
        <Label n="01" t="Manifesto" />
        <ScrubText text="Most websites are wallpaper. Pleasant, forgettable, scrolled past in three seconds. We think that is a crime. So we obsess over the details nobody asked for: the easing curve, the hover, the half second of delight. Until your brand stops blending in and starts being remembered." />
      </section>
      <Torch />
      <Services />
      <FeaturedWork />
      <section className="stats">
        <div><b><Counter to={100} /></b><span className="mono">Lighthouse score we aim for</span></div>
        <div><b><Counter to={2} /></b><span className="mono">Founders on every project</span></div>
        <div><b><Counter to={0} /></b><span className="mono">Templates. Ever.</span></div>
        <div><b><Counter to={24} suffix="h" /></b><span className="mono">Reply time, guaranteed</span></div>
      </section>
      <Founders />
      <Reviews />
      <Process />
      <Faq />
      <Cta />
    </main>
  )
}
