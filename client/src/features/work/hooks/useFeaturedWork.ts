import { useEffect, useMemo, useRef, useState, type PointerEvent } from 'react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { inSpinZone, workIntro } from '../../../shared/lib/motion'
import { joinParts, pad } from '../../../shared/lib/format'
import { useProjects } from './useProjects'

/** Home: up to 4 featured projects floating on a sphere. */
export function useFeaturedWork() {
  const all = useProjects()
  const ref = useRef<HTMLElement>(null)
  const cloud = useRef<HTMLDivElement>(null)
  const pointer = useRef<{ x: number; y: number } | null>(null)
  const [hover, setHover] = useState<string | null>(null)
  const [inZone, setInZone] = useState(false)

  const list = useMemo(() => {
    if (!all) return []
    const f = all.filter((p) => p.featured)
    return (f.length ? f : all).slice(0, 4)
  }, [all])
  const hovered = list.find((x) => x.slug === hover)

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

  const cloudProps = {
    ref: cloud,
    className: 'cloud' + (inZone ? ' zone' : ''),
    'data-cursor': hover ? 'Open' : inZone ? 'Spin' : undefined,
    onPointerMove: (e: PointerEvent<HTMLDivElement>) => { pointer.current = { x: e.clientX, y: e.clientY }; setInZone(inSpinZone(e.currentTarget, e.clientX, e.clientY)) },
    onPointerLeave: () => { pointer.current = null; setInZone(false) },
  }

  return {
    ref, cloudProps, list, setHover,
    title: hovered ? hovered.name : 'Work that gets remembered.',
    caption: hovered ? joinParts([hovered.kind, hovered.year]) : `${list.length} favourites from the archive`,
    titleOn: !!hovered,
    total: all ? pad(all.length) : null,
  }
}
