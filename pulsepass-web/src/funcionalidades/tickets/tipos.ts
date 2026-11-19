import { z } from 'zod'
import { FechaHoraLocalSchema, TicketStatusSchema, TicketTypeSchema } from '../../lib/tipos'

export { TicketStatusSchema, TicketTypeSchema }
export type { TicketStatus, TicketType } from '../../lib/tipos'

export const TicketResponseSchema = z.object({
  id: z.number().int(),
  ticketCode: z.string().min(1),
  type: TicketTypeSchema,
  price: z.number().nonnegative(),
  status: TicketStatusSchema,
  purchaseDate: FechaHoraLocalSchema,
  userEmail: z.email(),
  eventCode: z.string().min(1),
  eventName: z.string().min(1),
})
export type TicketResponse = z.infer<typeof TicketResponseSchema>

export const CompraTicketSchema = z.object({
  type: TicketTypeSchema,
})
export type CompraTicketForm = z.infer<typeof CompraTicketSchema>

export const PurchaseTicketRequestSchema = z.object({
  userEmail: z.email(),
  eventCode: z.string().min(1),
  type: TicketTypeSchema,
})
export type PurchaseTicketRequest = z.infer<typeof PurchaseTicketRequestSchema>

export const ValidacionTicketSchema = z.object({
  ticketCode: z.string().trim().min(1, 'El código del ticket es obligatorio'),
})
export type ValidacionTicketForm = z.infer<typeof ValidacionTicketSchema>
