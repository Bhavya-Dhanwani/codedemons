import { configureStore } from '@reduxjs/toolkit'
import { connectAuth } from '../shared/api/api'
import ui from '../shared/state/uiSlice'
import auth, { authStorage, loggedOut } from '../features/auth/state/authSlice'
import work from '../features/work/state/workSlice'
import crm from '../features/crm/state/crmSlice'

export const store = configureStore({ reducer: { ui, auth, work, crm } })

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

// keep tokens in localStorage in step with the store
let last = store.getState().auth
store.subscribe(() => {
  const now = store.getState().auth
  if (now === last) return
  last = now
  authStorage.admin.set(now.admin)
  authStorage.portal.set(now.portal)
})

// the axios interceptors read tokens from, and report expired sessions to, the store
connectAuth((s) => store.getState().auth[s], (s) => store.dispatch(loggedOut(s)))
