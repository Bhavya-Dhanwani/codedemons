import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

// the list's view and search survive going into a client and back
type CrmState = { view: string; q: string; adding: boolean }

const initialState: CrmState = { view: 'due', q: '', adding: false }

const crmSlice = createSlice({
  name: 'crm',
  initialState,
  reducers: {
    setView: (s, a: PayloadAction<string>) => { s.view = a.payload },
    setQuery: (s, a: PayloadAction<string>) => { s.q = a.payload },
    setAdding: (s, a: PayloadAction<boolean>) => { s.adding = a.payload },
  },
})

export const { setView, setQuery, setAdding } = crmSlice.actions
export default crmSlice.reducer
