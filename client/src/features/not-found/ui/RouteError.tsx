import { useRouteProblem } from '../hooks/useRouteProblem'
import { NotFoundView } from './NotFoundView'

/** Router errorElement: shown when a page throws while rendering or loading. */
export default function RouteError() {
  const { code, title } = useRouteProblem()
  return <NotFoundView code={code} title={title} />
}
