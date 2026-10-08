import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { storage } from '../../../shared/lib/storage'
import type { Scope } from '../../../shared/api/api'

// same keys as before the refactor, so nobody gets logged out by the update
export const authStorage: Record<Scope, ReturnType<typeof storage>> = {
  admin: storage('cd-admin-token'),
  portal: storage('cd-portal-token'),
}

type AuthState = Record<Scope, string | null>

const initialState: AuthState = { admin: authStorage.admin.get(), portal: authStorage.portal.get() }

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loggedIn: (s, a: PayloadAction<{ scope: Scope; token: string }>) => { s[a.payload.scope] = a.payload.token },
    loggedOut: (s, a: PayloadAction<Scope>) => { s[a.payload] = null },
  },
})

export const { loggedIn, loggedOut } = authSlice.actions
export default authSlice.reducer
