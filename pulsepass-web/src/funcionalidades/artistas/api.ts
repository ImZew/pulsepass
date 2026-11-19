import { z } from 'zod'
import { http } from '../../lib/http'
import { ArtistResponseSchema, type ArtistResponse } from './tipos'

const ListaArtistasSchema = z.array(ArtistResponseSchema)

export function listarArtistasActivos(): Promise<ArtistResponse[]> {
  return http('/artists/active', {
    method: 'GET',
    schema: ListaArtistasSchema,
  })
}

export function obtenerArtistaPorId(id: number): Promise<ArtistResponse> {
  return http(`/artists/${encodeURIComponent(String(id))}`, {
    method: 'GET',
    schema: ArtistResponseSchema,
  })
}

export function buscarArtistaPorNombre(stageName: string): Promise<ArtistResponse> {
  const params = new URLSearchParams({ stageName })
  return http(`/artists/by-stage-name?${params.toString()}`, {
    method: 'GET',
    schema: ArtistResponseSchema,
  })
}
