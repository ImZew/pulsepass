import { z } from 'zod'
import {
  CrearEventoSchema,
  EventCategorySchema,
  EventResponseSchema,
  EventStatusSchema,
  EventSummaryResponseSchema,
  type CrearEventoForm,
  type CreateEventRequest,
  type EventCategory,
  type EventResponse,
  type EventStatus,
  type EventSummaryResponse,
} from '../eventos/tipos'

export {
  CrearEventoSchema,
  EventCategorySchema,
  EventResponseSchema,
  EventStatusSchema,
  EventSummaryResponseSchema,
}
export type {
  CrearEventoForm,
  CreateEventRequest,
  EventCategory,
  EventResponse,
  EventStatus,
  EventSummaryResponse,
}

export const BuscarEventoAdminSchema = z.object({
  eventCode: z.string().trim().min(1, 'El código del evento es obligatorio'),
})
export type BuscarEventoAdminForm = z.infer<typeof BuscarEventoAdminSchema>

export const AsignarArtistaSchema = z.object({
  artistId: z.string().trim().min(1, 'Selecciona un artista'),
})
export type AsignarArtistaForm = z.infer<typeof AsignarArtistaSchema>

export interface EventoCreadoEnSesion {
  eventCode: string
  name: string
  category: EventCategory
  eventDate: string
  venueCode: string
  status: EventStatus
}

let eventosCreadosSesion: EventoCreadoEnSesion[] = []

export function registrarEventoCreadoEnSesion(evento: EventoCreadoEnSesion): void {
  const sinDuplicado = eventosCreadosSesion.filter(
    (item) => item.eventCode !== evento.eventCode,
  )
  eventosCreadosSesion = [evento, ...sinDuplicado]
}

export function actualizarEstadoEventoEnSesion(
  eventCode: string,
  nuevoEstado: EventStatus,
): void {
  eventosCreadosSesion = eventosCreadosSesion.map((item) =>
    item.eventCode === eventCode ? { ...item, status: nuevoEstado } : item,
  )
}

export function listarEventosCreadosEnSesion(): readonly EventoCreadoEnSesion[] {
  return eventosCreadosSesion
}

export function limpiarEventosCreadosEnSesion(): void {
  eventosCreadosSesion = []
}
