import { http } from '../../lib/http'
import { UserResponseSchema, type UserResponse } from './tipos'

/**
 * Consulta un usuario por su username (GET /api/users/{username}).
 * Decisión C-05: nunca usar /api/users/by-username.
 */
export function obtenerUsuarioPorUsername(username: string): Promise<UserResponse> {
  return http(`/users/${encodeURIComponent(username)}`, {
    method: 'GET',
    schema: UserResponseSchema,
  })
}
