import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export type WorkView = 'grid' | 'list'

const workSlice = createSlice({
  name: 'work',
  initialState: { filter: 'All', view: 'grid' as WorkView },
  reducers: {
    setFilter: (s, a: PayloadAction<string>) => { s.filter = a.payload },
    setView: (s, a: PayloadAction<WorkView>) => { s.view = a.payload },
  },
})

export const { setFilter, setView } = workSlice.actions
export default workSlice.reducer
