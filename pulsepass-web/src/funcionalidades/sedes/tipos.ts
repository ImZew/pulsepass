import { z } from 'zod'

export const VenueResponseSchema = z.object({
  code: z.string().min(1),
  name: z.string().min(1),
  city: z.string().min(1),
  capacity: z.number().int().nonnegative(),
  active: z.boolean(),
})
export type VenueResponse = z.infer<typeof VenueResponseSchema>
