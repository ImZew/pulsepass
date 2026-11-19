import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  cancelarTicket,
  comprarTicket,
  listarMisTickets,
  listarTicketsPagadosPorEvento,
  marcarTicketComoUsado,
  obtenerTicketPorCodigo,
} from './api'
import type { PurchaseTicketRequest } from './tipos'

const TREINTA_SEGUNDOS_MS = 30 * 1000

export function useMisTickets(email: string, habilitado = true) {
  const limpio = email.trim()
  return useQuery({
    queryKey: ['tickets', 'usuario', limpio],
    queryFn: () => listarMisTickets(limpio),
    enabled: habilitado && limpio.length > 0,
    staleTime: TREINTA_SEGUNDOS_MS,
  })
}

export function useTicket(ticketCode: string, habilitado = true) {
  const limpio = ticketCode.trim()
  return useQuery({
    queryKey: ['ticket', limpio],
    queryFn: () => obtenerTicketPorCodigo(limpio),
    enabled: habilitado && limpio.length > 0,
    staleTime: TREINTA_SEGUNDOS_MS,
  })
}

export function useComprarTicket() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: PurchaseTicketRequest) => comprarTicket(payload),
    onSuccess: async (ticket, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['tickets'] }),
        queryClient.invalidateQueries({ queryKey: ['tickets', 'usuario', variables.userEmail] }),
        queryClient.invalidateQueries({ queryKey: ['ticket', ticket.ticketCode] }),
      ])
    },
  })
}

export function useCancelarTicket() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (ticketCode: string) => cancelarTicket(ticketCode),
    onSuccess: async (_resultado, ticketCode) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['tickets'] }),
        queryClient.invalidateQueries({ queryKey: ['ticket', ticketCode] }),
      ])
    },
  })
}

export function useMarcarTicketComoUsado() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (ticketCode: string) => marcarTicketComoUsado(ticketCode),
    onSuccess: async (_resultado, ticketCode) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['ticket', ticketCode] }),
        queryClient.invalidateQueries({ queryKey: ['tickets', 'pagados'] }),
        queryClient.invalidateQueries({ queryKey: ['tickets'] }),
      ])
    },
  })
}

export function useTicketsPagadosPorEvento(eventCode: string, habilitado = true) {
  const limpio = eventCode.trim()
  return useQuery({
    queryKey: ['tickets', 'pagados', limpio],
    queryFn: () => listarTicketsPagadosPorEvento(limpio),
    enabled: habilitado && limpio.length > 0,
    staleTime: TREINTA_SEGUNDOS_MS,
  })
}
