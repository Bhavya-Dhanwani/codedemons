import { useEffect } from 'react'
import { isRouteErrorResponse, useRouteError } from 'react-router'

/** What the router's error boundary caught: a 404 from a loader, or a crash. */
export function useRouteProblem() {
  const error = useRouteError()
  const missing = isRouteErrorResponse(error) && error.status === 404
  useEffect(() => { if (!missing) console.error(error) }, [error, missing])
  return missing
    ? { code: '404', title: 'This page got lost in the dark.' }
    : { code: '500', title: 'Something broke. The demons are on it.' }
}
