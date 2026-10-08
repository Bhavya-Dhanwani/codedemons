import { useCursor } from '../hooks/useCursor'

export function Cursor() {
  const { ref, label } = useCursor()
  return <div className="cursor" ref={ref}><span>{label}</span></div>
}
