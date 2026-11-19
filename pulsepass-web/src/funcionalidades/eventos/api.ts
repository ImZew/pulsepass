import { z } from 'zod'
import { http } from '../../lib/http'
import {
  EventResponseSchema,
  EventSummaryResponseSchema,
  type EventResponse,
  type EventSummaryResponse,
} from './tipos'

const ListaEventosResumenSchema = z.array(EventSummaryResponseSchema)

export function listarEventosPublicados(): Promise<EventSummaryResponse[]> {
  return http('/events/published', {
    method: 'GET',
    schema: ListaEventosResumenSchema,
  })
}

export function obtenerEventoPorCodigo(eventCode: string): Promise<EventResponse> {
  return http(`/events/${encodeURIComponent(eventCode)}`, {
    method: 'GET',
    schema: EventResponseSchema,
  })
}

export function listarEventosPorArtista(stageName: string): Promise<EventSummaryResponse[]> {
  const params = new URLSearchParams({ stageName })
  return http(`/events/by-artist?${params.toString()}`, {
    method: 'GET',
    schema: ListaEventosResumenSchema,
  })
}
