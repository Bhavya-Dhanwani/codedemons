import { NotFoundView } from './NotFoundView'

/** Any URL no route matches. Rendered inside the site layout, so the nav stays. */
export default function NotFoundPage() {
  return <NotFoundView title="This page got lost in the dark." />
}
