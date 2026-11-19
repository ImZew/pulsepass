import { useQuery } from '@tanstack/react-query'
import { listarSedesActivas, obtenerSedePorCodigo } from './api'

const CINCO_MINUTOS_MS = 5 * 60 * 1000

export function useSedesActivas() {
  return useQuery({
    queryKey: ['sedes', 'activas'],
    queryFn: listarSedesActivas,
    staleTime: CINCO_MINUTOS_MS,
  })
}

export function useSede(code: string, habilitado = true) {
  const limpio = code.trim()
  return useQuery({
    queryKey: ['sede', limpio],
    queryFn: () => obtenerSedePorCodigo(limpio),
    enabled: habilitado && limpio.length > 0,
    staleTime: CINCO_MINUTOS_MS,
  })
}
