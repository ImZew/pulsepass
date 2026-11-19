import { QueryClientProvider, type QueryClient } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import { RouterProvider } from 'react-router'
import { AuthProvider } from '../funcionalidades/auth/AuthContext'
import { guardarToken } from '../lib/almacenSesion'
import { crearQueryClient } from '../lib/queryClient'
import { crearRouterMemoria } from '../router'

export interface OpcionesRenderConProveedores {
  rutaInicial?: string
  rutasIniciales?: string[]
  tokenInicial?: string
  expiresInSegundos?: number
  queryClient?: QueryClient
}

export function renderConProveedores(opciones: OpcionesRenderConProveedores = {}) {
  const {
    rutaInicial = '/',
    rutasIniciales,
    tokenInicial,
    expiresInSegundos = 900,
    queryClient = crearQueryClient(),
  } = opciones

  if (tokenInicial !== undefined) {
    guardarToken(tokenInicial, expiresInSegundos)
  }

  const router = crearRouterMemoria(rutasIniciales ?? [rutaInicial])

  const resultado = render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </QueryClientProvider>,
  )

  return {
    ...resultado,
    router,
    queryClient,
  }
}
