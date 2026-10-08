import { Reveal } from '../../../shared/components/motion/Reveal'
import { useWorkPage } from '../hooks/useWorkPage'
import { FilterBar } from './FilterBar'
import { ReelsGrid } from './ReelsGrid'
import { WorkIndex } from './WorkIndex'

export default function WorkPage() {
  const w = useWorkPage()
  return (
    <main className="wp" ref={w.ref}>
      <header className="wp-head">
        <span className="mono label">Index of everything</span>
        <div className="wp-title">
          <Reveal as="h1" text="All work" className="mega" />
          {w.total && <sup className="mono">({w.total})</sup>}
        </div>
        <FilterBar kinds={w.kinds} filter={w.filter} view={w.view} onFilter={w.pickFilter} onView={w.pickView} />
      </header>

      {w.loading && <p className="wp-empty mono">Loading the archive</p>}
      {w.empty && <p className="wp-empty mono">Nothing here yet</p>}

      {w.view === 'grid' ? <ReelsGrid list={w.list} filter={w.filter} /> : <WorkIndex list={w.list} />}

      <section className="wp-cta">
        <span className="mono label">Your turn</span>
        <a href="/#contact" className="mega accent-line wp-cta-link" data-cursor="Talk">Yours next?</a>
      </section>
    </main>
  )
}
