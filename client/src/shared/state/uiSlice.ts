import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

type UiState = {
  toast: string
  /** the preloader only plays when landing on the home page */
  preloaded: boolean
}

const initialState: UiState = { toast: '', preloaded: location.pathname !== '/' }

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    showToast: (s, a: PayloadAction<string>) => { s.toast = a.payload },
    hideToast: (s) => { s.toast = '' },
    preloadDone: (s) => { s.preloaded = true },
  },
})

export const { showToast, hideToast, preloadDone } = uiSlice.actions
export default uiSlice.reducer
