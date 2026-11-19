import { z } from 'zod'
import { http } from '../../lib/http'
import { VenueResponseSchema, type VenueResponse } from './tipos'

const ListaSedesSchema = z.array(VenueResponseSchema)

export function listarSedesActivas(): Promise<VenueResponse[]> {
  return http('/venues/active', {
    method: 'GET',
    schema: ListaSedesSchema,
  })
}

export function obtenerSedePorCodigo(code: string): Promise<VenueResponse> {
  return http(`/venues/${encodeURIComponent(code)}`, {
    method: 'GET',
    schema: VenueResponseSchema,
  })
}
