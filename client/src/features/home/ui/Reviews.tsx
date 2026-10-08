import type { Review } from '../../../shared/types/content'
import { Reveal } from '../../../shared/components/motion/Reveal'
import { SectionLabel } from '../../../shared/components/SectionLabel'
import { useReviews } from '../hooks/useReviews'
import { useReviewCard } from '../hooks/useReviewCard'

function ReviewCard({ r }: { r: Review }) {
  const v = useReviewCard(r)
  return (
    <figure className="review" onClick={v.toggle} data-cursor={v.cursor}>
      {r.video && <video ref={v.video} src={v.src} poster={v.poster} playsInline preload="metadata" onEnded={v.ended} />}
      {!v.playing && (
        <div className="review-overlay">
          {r.video && <span className="play">Play</span>}
          {r.quote && <blockquote>"{r.quote}"</blockquote>}
        </div>
      )}
      <figcaption><b>{r.who}</b><span className="mono">{r.company}</span></figcaption>
    </figure>
  )
}

export function Reviews() {
  const reviews = useReviews()
  if (!reviews.length) return null
  return (
    <section className="reviews" id="reviews">
      <div className="section-head">
        <SectionLabel n="06" t="Kind words" />
        <Reveal text="Don't take our word for it." className="h2" />
      </div>
      <div className="review-grid">{reviews.map((r) => <ReviewCard key={r._id} r={r} />)}</div>
    </section>
  )
}
