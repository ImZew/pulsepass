import { z } from 'zod'

export const UserResponseSchema = z.object({
  username: z.string().min(1),
  email: z.email(),
  active: z.boolean(),
})
export type UserResponse = z.infer<typeof UserResponseSchema>
