import { useQuery } from '@tanstack/react-query'
import { obtenerUsuarioPorUsername } from './api'

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
