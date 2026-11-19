import { z } from 'zod'
import {
  TicketResponseSchema,
  TicketStatusSchema,
  TicketTypeSchema,
  ValidacionTicketSchema,
  type TicketResponse,
  type TicketStatus,
  type TicketType,
  type ValidacionTicketForm,
} from '../tickets/tipos'

export {
  TicketResponseSchema,
  TicketStatusSchema,
  TicketTypeSchema,
  ValidacionTicketSchema,
}
export type {
  TicketResponse,
  TicketStatus,
  TicketType,
  ValidacionTicketForm,
}

export const ConsultaEventoStaffSchema = z.object({
  eventCode: z.string().trim().min(1, 'El código del evento es obligatorio'),
})
export type ConsultaEventoStaffForm = z.infer<typeof ConsultaEventoStaffSchema>
