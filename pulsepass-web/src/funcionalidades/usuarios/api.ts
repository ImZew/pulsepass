import { http } from '../../lib/http'
import { UserResponseSchema, type UserResponse } from './tipos'

/**
 * Consulta un usuario por su username (GET /api/users/{username}).
 * Decisión C-05: nunca usar /api/users/by-username.
 */
export function obtenerUsuarioPorUsername(username: string): Promise<UserResponse> {
  return http(`/users/${encodeURIComponent(username.trim())}`, {
    method: 'GET',
    schema: UserResponseSchema,
  })
}

/**
 * Consulta un usuario por su correo electrónico (GET /api/users/by-email?email=).
 */
export function obtenerUsuarioPorEmail(email: string): Promise<UserResponse> {
  const params = new URLSearchParams({ email: email.trim() })
  return http(`/users/by-email?${params.toString()}`, {
    method: 'GET',
    schema: UserResponseSchema,
  })
}

