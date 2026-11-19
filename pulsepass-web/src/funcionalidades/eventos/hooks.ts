import { useQuery } from '@tanstack/react-query'
import {
  listarEventosPorArtista,
  listarEventosPublicados,
  obtenerEventoPorCodigo,
} from './api'

const SESENTA_SEGUNDOS_MS = 60 * 1000
const TREINTA_SEGUNDOS_MS = 30 * 1000

export function useEventosPublicados(habilitado = true) {
  return useQuery({
    queryKey: ['eventos', 'publicados'],
    queryFn: listarEventosPublicados,
    enabled: habilitado,
    staleTime: SESENTA_SEGUNDOS_MS,
  })
}

export function useEvento(eventCode: string, habilitado = true) {
  const limpio = eventCode.trim()
  return useQuery({
    queryKey: ['evento', limpio],
    queryFn: () => obtenerEventoPorCodigo(limpio),
    enabled: habilitado && limpio.length > 0,
    staleTime: TREINTA_SEGUNDOS_MS,
  })
}

export function useEventosPorArtista(stageName: string, habilitado = true) {
  const limpio = stageName.trim()
  return useQuery({
    queryKey: ['eventos', 'artista', limpio],
    queryFn: () => listarEventosPorArtista(limpio),
    enabled: habilitado && limpio.length > 0,
    staleTime: SESENTA_SEGUNDOS_MS,
  })
}
