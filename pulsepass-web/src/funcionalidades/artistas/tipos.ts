import { z } from 'zod'

export const ArtistResponseSchema = z.object({
  id: z.number().int(),
  stageName: z.string().min(1),
  active: z.boolean(),
})
export type ArtistResponse = z.infer<typeof ArtistResponseSchema>
