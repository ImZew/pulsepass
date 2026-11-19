import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterAll, afterEach, beforeAll } from 'vitest'
import { borrarToken } from '../lib/almacenSesion'
import { server } from './mocks/server'

// Sin red real: cualquier petición no simulada hace fallar la prueba (QT-FE-009).
beforeAll(() => {
  server.listen({ onUnhandledFrame: 'error' })
})

afterEach(() => {
  cleanup()
  server.resetHandlers()
  borrarToken()
  window.sessionStorage.clear()
})

afterAll(() => {
  server.close()
})
