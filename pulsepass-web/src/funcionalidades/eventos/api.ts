import { z } from 'zod'
import { normalizarFechaHoraBackend } from '../../lib/formato'
import { http } from '../../lib/http'
import {
  EventResponseSchema,
  EventSummaryResponseSchema,
  type CreateEventRequest,
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

export async function crearEvento(payload: CreateEventRequest): Promise<void> {
  const descripcionLimpia = payload.description?.trim()
  const cuerpo = {
    eventCode: payload.eventCode.trim(),
    name: payload.name.trim(),
    ...(descripcionLimpia && descripcionLimpia.length > 0
      ? { description: descripcionLimpia }
      : {}),
    category: payload.category,
    eventDate: normalizarFechaHoraBackend(payload.eventDate),
    minimumAge: payload.minimumAge,
    venueCode: payload.venueCode.trim(),
  }

  await http('/events', {
    method: 'POST',
    body: cuerpo,
  })
}

export async function publicarEvento(eventCode: string): Promise<void> {
  await http(`/events/${encodeURIComponent(eventCode.trim())}/publish`, {
    method: 'PATCH',
  })
}

export async function asignarArtistaAEvento(
  eventCode: string,
  artistId: number,
): Promise<void> {
  await http(
    `/events/${encodeURIComponent(eventCode.trim())}/artists/${encodeURIComponent(String(artistId))}`,
    {
      method: 'POST',
    },
  )
}


