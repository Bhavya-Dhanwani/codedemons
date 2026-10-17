import { Provider } from 'react-redux'
import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router/dom'
import { store } from './store'
import { queryClient } from './queryClient'
import { router } from './router'
import { RootBoundary } from './RootBoundary'

export default function App() {
  return (
    <RootBoundary>
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
        </QueryClientProvider>
      </Provider>
    </RootBoundary>
  )
}
