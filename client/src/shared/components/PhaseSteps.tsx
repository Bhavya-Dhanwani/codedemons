import { PHASES, type Phase } from '../constants/site'
import { label } from '../lib/format'

/** Project stage strip. Read only, or clickable when `onPick` is given. */
export function PhaseSteps({ current, onPick }: { current: string; onPick?: (p: Phase) => void }) {
  const at = PHASES.indexOf(current as Phase)
  return (
    <ol className={'steps' + (onPick ? '' : ' readonly')}>
      {PHASES.map((p, i) => (
        <li key={p} className={at >= i ? 'on' : ''}>
          {onPick ? <button type="button" onClick={() => onPick(p)}>{label(p)}</button> : <span>{label(p)}</span>}
        </li>
      ))}
    </ol>
  )
}
