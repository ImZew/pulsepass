import { z } from 'zod'

export const EventCategorySchema = z.enum([
  'MUSIC',
  'SPORTS',
  'TECHNOLOGY',
  'EDUCATION',
  'CULTURE',
  'ENTERTAINMENT',
])
export type EventCategory = z.infer<typeof EventCategorySchema>

export const EventStatusSchema = z.enum([
  'DRAFT',
  'PUBLISHED',
  'SOLD_OUT',
  'CANCELLED',
  'FINISHED',
])
export type EventStatus = z.infer<typeof EventStatusSchema>

export const TicketTypeSchema = z.enum(['GENERAL', 'VIP', 'BACKSTAGE', 'STUDENT'])
export type TicketType = z.infer<typeof TicketTypeSchema>

export const TicketStatusSchema = z.enum(['RESERVED', 'PAID', 'CANCELLED', 'USED'])
export type TicketStatus = z.infer<typeof TicketStatusSchema>

export const RolSchema = z.enum(['USER', 'STAFF', 'ADMIN'])
export type Rol = z.infer<typeof RolSchema>

export const FechaHoraLocalSchema = z
  .string()
  .regex(
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?$/,
    'Formato de fecha y hora inválido',
  )

export const ErrorResponseSchema = z.object({
  timestamp: z.string(),
  status: z.number().int(),
  error: z.string(),
  message: z.string(),
  details: z.record(z.string(), z.string()).optional().default({}),
})
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>
