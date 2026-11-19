import { http } from '../../lib/http'
import {
  AuthenticatedUserResponseSchema,
  AuthResponseSchema,
  type AuthenticatedUserResponse,
  type AuthResponse,
  type LoginRequest,
  type RegisterUserRequest,
} from './tipos'

export function iniciarSesionApi(credenciales: LoginRequest): Promise<AuthResponse> {
  return http('/auth/login', {
    method: 'POST',
    body: credenciales,
    schema: AuthResponseSchema,
  })
}

export function obtenerUsuarioActual(): Promise<AuthenticatedUserResponse> {
  return http('/auth/me', {
    method: 'GET',
    schema: AuthenticatedUserResponseSchema,
  })
}

export async function registrarUsuario(datos: RegisterUserRequest): Promise<void> {
  const payload = {
    username: datos.username,
    email: datos.email,
    firstName: datos.firstName,
    lastName: datos.lastName,
    phone: datos.phone && datos.phone.length > 0 ? datos.phone : undefined,
    city: datos.city && datos.city.length > 0 ? datos.city : undefined,
    birthDate: datos.birthDate,
    password: datos.password,
  }
  await http('/users', {
    method: 'POST',
    body: payload,
  })
}
