import { lazy } from 'react'
import { Magnetic } from '../../../shared/components/motion/Magnetic'
import { SafeSuspense } from '../../../shared/components/SafeSuspense'
import { useFeaturedWork } from '../hooks/useFeaturedWork'

const Work3D = lazy(() => import('./Work3D'))

/** Home: the favourite projects floating as a cloud on a sphere, then a link to everything. */
export function FeaturedWork() {
  const f = useFeaturedWork()
  return (
    <section className="featured" id="work" ref={f.ref}>
      <div {...f.cloudProps}>
        <div className="cloud-ring" aria-hidden />
        <div className="cloud-head">
          <span className="mono label">04 / Selected work</span>
          <span className="mono label">Scroll or drag the circle to spin</span>
        </div>
        {f.list.length > 0 && <SafeSuspense><Work3D projects={f.list} onHover={f.setHover} /></SafeSuspense>}
        <div className={'cloud-title' + (f.titleOn ? ' on' : '')} aria-live="polite">
          <h2>{f.title}</h2>
          <span className="mono">{f.caption}</span>
        </div>
      </div>
      {f.total && (
        <div className="feat-more">
          <Magnetic><a href="/work" className="pill-big" data-cursor="hidden">See all work <sup>{f.total}</sup></a></Magnetic>
        </div>
      )}
    </section>
  )
}
