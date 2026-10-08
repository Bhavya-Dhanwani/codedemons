import { useNavigate, useSearchParams } from 'react-router'
import { useQueryClient } from '@tanstack/react-query'
import type { Scope } from '../../../shared/api/api'
import { useAppDispatch, useAppSelector } from '../../../shared/hooks/store'
import { loggedIn, loggedOut } from '../state/authSlice'

/** The token for a scope; null when logged out (or the session expired). */
export const useToken = (scope: Scope) => useAppSelector((s) => s.auth[scope])

export function useLogout(scope: Scope) {
  const dispatch = useAppDispatch()
  return () => dispatch(loggedOut(scope))
}

/** Saves the token, drops the previous session's cached data, goes to ?next= (or the scope's home). */
export function useStartSession(scope: Scope) {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [params] = useSearchParams()
  const next = params.get('next')
  return (token: string) => {
    qc.removeQueries({ queryKey: [scope] })
    dispatch(loggedIn({ scope, token }))
    navigate(next?.startsWith(`/${scope}`) ? next : `/${scope}`, { replace: true })
  }
}
