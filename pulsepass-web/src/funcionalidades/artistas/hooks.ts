import { useQuery } from '@tanstack/react-query'
import {
  buscarArtistaPorNombre,
  listarArtistasActivos,
  obtenerArtistaPorId,
} from './api'

const CINCO_MINUTOS_MS = 5 * 60 * 1000

export function useArtistasActivos() {
  return useQuery({
    queryKey: ['artistas', 'activos'],
    queryFn: listarArtistasActivos,
    staleTime: CINCO_MINUTOS_MS,
  })
}

export function useArtista(id: number, habilitado = true) {
  return useQuery({
    queryKey: ['artista', id],
    queryFn: () => obtenerArtistaPorId(id),
    enabled: habilitado && Number.isInteger(id) && id > 0,
    staleTime: CINCO_MINUTOS_MS,
  })
}

export function useArtistaPorNombre(stageName: string) {
  const limpio = stageName.trim()
  return useQuery({
    queryKey: ['artista', 'nombre', limpio],
    queryFn: () => buscarArtistaPorNombre(limpio),
    enabled: limpio.length > 0,
    staleTime: CINCO_MINUTOS_MS,
  })
}
