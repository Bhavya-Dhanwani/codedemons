import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import Lenis from 'lenis'
import { Marquee } from './ui'
import { Logo, Mark } from './Logo'
import { EMAIL } from './data'
import Home from './Home'
import Project from './Project'
import WorkPage from './Work'
import Admin from './Admin'

function useClock() {
  const [t, setT] = useState('')
  useEffect(() => {
    const tick = () => setT(new Date().toLocaleTimeString('en-GB', { timeZone: 'Asia/Kolkata' }))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])
  return t
}

function Preloader({ onDone }: { onDone: () => void }) {
  const ref = useRef<HTMLDivElement>(null)
  useGSAP(() => {
    const o = { v: 0 }
    gsap.timeline({ onComplete: onDone })
      .to(o, { v: 100, duration: 1.6, ease: 'power2.inOut', onUpdate: () => { ref.current!.querySelector('.pl-num')!.textContent = String(Math.round(o.v)).padStart(3, '0') } })
      .to('.pl-bar i', { scaleX: 1, duration: 1.6, ease: 'power2.inOut' }, 0)
      .to(ref.current, { clipPath: 'inset(0 0 100% 0)', duration: 1, ease: 'expo.inOut' }, '+=0.1')
  }, { scope: ref })
  return (
    <div className="preloader" ref={ref}>
      <Mark size={64} />
      <div className="pl-num">000</div>
      <div className="pl-bar"><i /></div>
      <p className="mono">Summoning the demons</p>
    </div>
  )
}

/** Dot cursor; grows over links and shows a label from the nearest [data-cursor]. */
function Cursor() {
  const ref = useRef<HTMLDivElement>(null)
  const [label, setLabel] = useState('')
  useEffect(() => {
    if (matchMedia('(pointer: coarse)').matches) return
    const x = gsap.quickTo(ref.current, 'x', { duration: 0.35, ease: 'power3' })
    const y = gsap.quickTo(ref.current, 'y', { duration: 0.35, ease: 'power3' })
    const root = document.documentElement
    const move = (e: PointerEvent) => {
      x(e.clientX); y(e.clientY)
      // shared pointer position, used by CSS eyes that follow the cursor
      root.style.setProperty('--mx', String((e.clientX / innerWidth) * 2 - 1))
      root.style.setProperty('--my', String((e.clientY / innerHeight) * 2 - 1))
      const t = e.target as HTMLElement
      const l = t.closest<HTMLElement>('[data-cursor]')?.dataset.cursor ?? ''
      setLabel(l)
      ref.current!.className = 'cursor' + (l === 'hidden' ? ' gone' : l ? ' label' : t.closest('a,button') ? ' big' : '')
    }
    addEventListener('pointermove', move)
    return () => removeEventListener('pointermove', move)
  }, [])
  return <div className="cursor" ref={ref}><span>{label !== 'hidden' ? label : ''}</span></div>
}

export default function App() {
  // the preloader only plays when landing on the home page
  const [loaded, setLoaded] = useState(location.pathname !== '/')
  const [path, setPath] = useState(location.pathname)
  const curtain = useRef<HTMLDivElement>(null)
  const lenis = useRef<Lenis | null>(null)
  const time = useClock()

  // smooth scroll driving ScrollTrigger
  useEffect(() => {
    if (location.pathname.startsWith('/admin')) return
    const l = new Lenis({ lerp: 0.09 })
    lenis.current = l
    l.on('scroll', ScrollTrigger.update)
    const raf = (t: number) => l.raf(t * 1000)
    gsap.ticker.add(raf)
    gsap.ticker.lagSmoothing(0)
    // one soft glide (e.g. centring the work globe); easeOutCubic so it settles instead of snapping
    const by = (e: Event) => l.scrollTo(l.scroll + (e as CustomEvent<number>).detail, { duration: 0.9, easing: (k) => 1 - (1 - k) ** 3 })
    addEventListener('cd:scrollby', by)
    return () => { gsap.ticker.remove(raf); l.destroy(); removeEventListener('cd:scrollby', by) }
  }, [])

  // router: internal links and go() play a curtain transition between pages
  useEffect(() => {
    const navigate = (to: string, push = true) => {
      const [p, hash] = to.split('#')
      const target = p || '/'
      const scrollHash = () => hash && lenis.current?.scrollTo('#' + hash, { duration: 1.4 })
      if (target === location.pathname) { scrollHash(); return }
      gsap.timeline()
        .set(curtain.current, { yPercent: 100, display: 'grid' })
        .to(curtain.current, { yPercent: 0, duration: 0.7, ease: 'expo.inOut' })
        .add(() => {
          if (push) history.pushState(null, '', to)
          setPath(target)
          lenis.current?.scrollTo(0, { immediate: true })
        })
        .to(curtain.current, { yPercent: -100, duration: 0.8, ease: 'expo.inOut', delay: 0.25 })
        .add(() => {
          ScrollTrigger.refresh()
          if (hash) setTimeout(() => lenis.current?.scrollTo('#' + hash, { immediate: true }), 50)
        })
    }
    const click = (e: MouseEvent) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button) return
      const a = (e.target as HTMLElement).closest('a')
      const href = a?.getAttribute('href')
      if (!href || !(href.startsWith('/') || href.startsWith('#'))) return
      if (href.startsWith('/admin') || location.pathname.startsWith('/admin')) return
      e.preventDefault()
      navigate(href.startsWith('#') ? location.pathname + href : href)
    }
    const goEv = (e: Event) => navigate((e as CustomEvent<string>).detail)
    const pop = () => setPath(location.pathname)
    document.addEventListener('click', click)
    addEventListener('cd:go', goEv)
    addEventListener('popstate', pop)
    return () => { document.removeEventListener('click', click); removeEventListener('cd:go', goEv); removeEventListener('popstate', pop) }
  }, [])

  const slug = path.match(/^\/work\/([\w-]+)/)?.[1]

  if (path.startsWith('/admin')) return <Admin />

  const page = slug ? <Project slug={slug} /> : path.startsWith('/work') ? <WorkPage /> : <Home ready={loaded} />

  return (
    <>
      {!loaded && path === '/' && <Preloader onDone={() => setLoaded(true)} />}
      <div className="curtain" ref={curtain} aria-hidden><Mark size={56} /></div>
      <Cursor />
      <div className="grain" aria-hidden />

      <header className="nav">
        <a href="/" className="logo"><Logo /></a>
        <span className="mono nav-time">{time} IST</span>
        <a href={`mailto:${EMAIL}`} className="mono nav-cta">Start a project</a>
      </header>

      <nav className="dock mono">
        <a href="/#services">Services</a><a href="/work">Work</a><a href="/#about">About</a><a href="/#reviews">Reviews</a><a href="/#faq">FAQ</a><a href="/#contact" className="dock-cta">Contact</a>
      </nav>

      {page}

      <footer className="footer">
        <Marquee reverse>
          {[0, 1].map((i) => <span className="foot-word" key={i}>codedemons<Mark size={90} /></span>)}
        </Marquee>
        <div className="foot-row mono">
          <span>2026 codedemons</span>
          <span>Bhavya Dhanwani &amp; Sameer Bhagtani</span>
          <span>Made with mischief</span>
        </div>
      </footer>
    </>
  )
}
