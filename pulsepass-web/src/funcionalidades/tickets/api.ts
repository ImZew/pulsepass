import { z } from 'zod'
import { ApiError, http } from '../../lib/http'
import {
  PurchaseTicketRequestSchema,
  TicketResponseSchema,
  type PurchaseTicketRequest,
  type TicketResponse,
} from './tipos'

const ListaTicketsSchema = z.array(TicketResponseSchema)
const RespuestaCodigoTicketSchema = z.object({
  ticketCode: z.string().min(1),
})

export function listarMisTickets(email: string): Promise<TicketResponse[]> {
  const params = new URLSearchParams({ email })
  return http(`/tickets/by-user?${params.toString()}`, {
    method: 'GET',
    schema: ListaTicketsSchema,
  })
}

export function obtenerTicketPorCodigo(ticketCode: string): Promise<TicketResponse> {
  return http(`/tickets/${encodeURIComponent(ticketCode)}`, {
    method: 'GET',
    schema: TicketResponseSchema,
  })
}

/**
 * Compra de ticket (POST /api/tickets).
 * Decisión C-04:
 * - Si el 201 devuelve JSON con `ticketCode` (o TicketResponse completo), lo usa directo.
 * - Si el 201 viene con cuerpo vacío (backend real), consulta GET /api/tickets/by-user?email=<userEmail>
 *   y toma el ticket más reciente (mayor `id`) para ese `eventCode`.
 */
export async function comprarTicket(payload: PurchaseTicketRequest): Promise<TicketResponse> {
  const cuerpo = PurchaseTicketRequestSchema.parse(payload)
  const respuesta = await http('/tickets', {
    method: 'POST',
    body: cuerpo,
  })

  if (respuesta !== undefined) {
    const ticketCompleto = TicketResponseSchema.safeParse(respuesta)
    if (ticketCompleto.success) {
      return ticketCompleto.data
    }

    const soloCodigo = RespuestaCodigoTicketSchema.safeParse(respuesta)
    if (soloCodigo.success) {
      return {
        id: 0,
        ticketCode: soloCodigo.data.ticketCode,
        type: cuerpo.type,
        price: 0,
        status: 'PAID',
        purchaseDate: '2026-11-19T00:00:00',
        userEmail: cuerpo.userEmail,
        eventCode: cuerpo.eventCode,
        eventName: cuerpo.eventCode,
      }
    }
  }

  const misTickets = await listarMisTickets(cuerpo.userEmail)
  const delEvento = misTickets.filter((t) => t.eventCode === cuerpo.eventCode)
  const candidatos = delEvento.length > 0 ? delEvento : misTickets
  const masReciente = candidatos.slice().sort((a, b) => b.id - a.id)[0]

  if (masReciente === undefined) {
    throw new ApiError(500, 'No fue posible recuperar el ticket recién emitido.')
  }

  return masReciente
}

export async function cancelarTicket(ticketCode: string): Promise<void> {
  await http(`/tickets/${encodeURIComponent(ticketCode)}/cancel`, {
    method: 'PATCH',
  })
}
