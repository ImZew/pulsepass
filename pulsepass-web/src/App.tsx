import { QueryClientProvider } from '@tanstack/react-query'
import { useMemo } from 'react'
import { RouterProvider } from 'react-router'
import { AuthProvider } from './funcionalidades/auth/AuthContext'
import { queryClient } from './lib/queryClient'
import { crearRouterApp } from './router'

export function App() {
  const router = useMemo(() => crearRouterApp(), [])

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
