import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

type CrmState = {
  view: string
  q: string
  /** client open in the drawer */
  openId: string | null
  adding: boolean
}

const initialState: CrmState = { view: 'due', q: '', openId: null, adding: false }

const crmSlice = createSlice({
  name: 'crm',
  initialState,
  reducers: {
    setView: (s, a: PayloadAction<string>) => { s.view = a.payload },
    setQuery: (s, a: PayloadAction<string>) => { s.q = a.payload },
    openClient: (s, a: PayloadAction<string | null>) => { s.openId = a.payload; s.adding = false },
    setAdding: (s, a: PayloadAction<boolean>) => { s.adding = a.payload },
  },
})

export const { setView, setQuery, openClient, setAdding } = crmSlice.actions
export default crmSlice.reducer
