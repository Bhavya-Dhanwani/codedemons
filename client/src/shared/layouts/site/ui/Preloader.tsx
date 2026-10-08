import { Mark } from '../../../components/brand/Logo'
import { usePreloader } from '../hooks/usePreloader'

export function Preloader() {
  const ref = usePreloader()
  return (
    <div className="preloader" ref={ref}>
      <Mark size={64} />
      <div className="pl-num">000</div>
      <div className="pl-bar"><i /></div>
      <p className="mono">Summoning the demons</p>
    </div>
  )
}
