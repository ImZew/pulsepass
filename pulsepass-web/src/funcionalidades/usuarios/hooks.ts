import { useQuery } from '@tanstack/react-query'
import { obtenerUsuarioPorEmail, obtenerUsuarioPorUsername } from './api'

const SESENTA_SEGUNDOS_MS = 60 * 1000

export function useUsuario(username: string, habilitado = true) {
  const limpio = username.trim()
  return useQuery({
    queryKey: ['usuario', limpio],
    queryFn: () => obtenerUsuarioPorUsername(limpio),
    enabled: habilitado && limpio.length > 0,
    staleTime: SESENTA_SEGUNDOS_MS,
  })
}

export function useUsuarioPorEmail(email: string, habilitado = true) {
  const limpio = email.trim()
  return useQuery({
    queryKey: ['usuario', 'email', limpio],
    queryFn: () => obtenerUsuarioPorEmail(limpio),
    enabled: habilitado && limpio.length > 0,
    staleTime: SESENTA_SEGUNDOS_MS,
  })
}

