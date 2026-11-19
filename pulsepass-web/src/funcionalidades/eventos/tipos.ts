import { z } from 'zod'
import { EventCategorySchema, EventStatusSchema, FechaHoraLocalSchema } from '../../lib/tipos'
import { ArtistResponseSchema } from '../artistas/tipos'

export { EventCategorySchema, EventStatusSchema }
export type { EventCategory, EventStatus } from '../../lib/tipos'

export const EventSummaryResponseSchema = z.object({
  eventCode: z.string().min(1),
  name: z.string().min(1),
  status: EventStatusSchema,
  eventDate: FechaHoraLocalSchema,
  venueName: z.string().min(1),
  category: EventCategorySchema.optional(),
  city: z.string().optional(),
})
export type EventSummaryResponse = z.infer<typeof EventSummaryResponseSchema>

export const EventResponseSchema = z.object({
  id: z.number().int(),
  eventCode: z.string().min(1),
  name: z.string().min(1),
  description: z.string().nullable(),
  category: EventCategorySchema,
  status: EventStatusSchema,
  eventDate: FechaHoraLocalSchema,
  minimumAge: z.number().int().nullable(),
  venueCode: z.string().min(1),
  venueName: z.string().min(1),
  artists: z.array(ArtistResponseSchema),
})
export type EventResponse = z.infer<typeof EventResponseSchema>

export const CrearEventoSchema = z.object({
  eventCode: z.string().trim().min(1, 'El código del evento es obligatorio'),
  name: z.string().trim().min(1, 'El nombre del evento es obligatorio'),
  description: z
    .string()
    .max(500, 'La descripción supera la longitud máxima de 500 caracteres')
    .optional(),
  category: EventCategorySchema,
  eventDate: z
    .string()
    .trim()
    .min(1, 'La fecha del evento es obligatoria')
    .regex(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/,
      'Formato de fecha y hora inválido',
    ),
  minimumAge: z
    .number({ message: 'La edad mínima debe ser un número entero' })
    .int('La edad mínima debe ser un número entero')
    .min(0, 'La edad mínima no puede ser negativa'),
  venueCode: z.string().trim().min(1, 'La sede es obligatoria'),
})
export type CreateEventRequest = z.infer<typeof CrearEventoSchema>
export type CrearEventoForm = CreateEventRequest
