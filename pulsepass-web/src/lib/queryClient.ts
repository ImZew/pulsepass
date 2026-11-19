import { QueryClient } from '@tanstack/react-query'
import { ApiError } from './http'

/** Máximo de reintentos para errores de red (status 0) y 5xx. */
export const MAX_REINTENTOS = 1

/**
 * Política de reintentos (PRD §14.3): 4xx nunca se reintenta; red/5xx una vez.
 * Errores que no son ApiError (p. ej. contrato zod roto) tampoco se reintentan.
 */
export function debeReintentar(fallosPrevios: number, error: unknown): boolean {
  if (!(error instanceof ApiError)) return false
  if (error.status >= 400 && error.status < 500) return false
  return fallosPrevios < MAX_REINTENTOS
}

export function crearQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: debeReintentar,
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: false,
      },
    },
  })
}

export const queryClient = crearQueryClient()
