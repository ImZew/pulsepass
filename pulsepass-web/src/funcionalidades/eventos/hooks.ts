import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  asignarArtistaAEvento,
  crearEvento,
  listarEventosPorArtista,
  listarEventosPublicados,
  obtenerEventoPorCodigo,
  publicarEvento,
} from './api'
import type { CreateEventRequest } from './tipos'

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

export function useCrearEvento() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateEventRequest) => crearEvento(payload),
    onSuccess: async (_resultado, variables) => {
      const codigoLimpio = variables.eventCode.trim()
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['eventos'] }),
        queryClient.invalidateQueries({ queryKey: ['evento', codigoLimpio] }),
      ])
    },
  })
}

export function usePublicarEvento() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (eventCode: string) => publicarEvento(eventCode),
    onSuccess: async (_resultado, eventCode) => {
      const codigoLimpio = eventCode.trim()
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['evento', codigoLimpio] }),
        queryClient.invalidateQueries({ queryKey: ['eventos'] }),
      ])
    },
  })
}

export interface AsignarArtistaVariables {
  eventCode: string
  artistId: number
}

export function useAsignarArtistaAEvento() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ eventCode, artistId }: AsignarArtistaVariables) =>
      asignarArtistaAEvento(eventCode, artistId),
    onSuccess: async (_resultado, variables) => {
      const codigoLimpio = variables.eventCode.trim()
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['evento', codigoLimpio] }),
        queryClient.invalidateQueries({ queryKey: ['eventos'] }),
      ])
    },
  })
}

export const useAsociarArtista = useAsignarArtistaAEvento

