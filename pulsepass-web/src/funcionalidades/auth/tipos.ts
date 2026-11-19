import { z } from 'zod'
import { RolSchema } from '../../lib/tipos'

export { RolSchema }
export type { Rol } from '../../lib/tipos'

export const AuthResponseSchema = z.object({
  accessToken: z.string().min(1),
  tokenType: z.literal('Bearer'),
  expiresIn: z.number().int().positive(),
})
export type AuthResponse = z.infer<typeof AuthResponseSchema>

export const AuthenticatedUserResponseSchema = z.object({
  id: z.number().int(),
  username: z.string().min(1),
  email: z.email(),
  roles: z.array(RolSchema),
})
export type AuthenticatedUserResponse = z.infer<typeof AuthenticatedUserResponseSchema>
export type UsuarioAutenticado = AuthenticatedUserResponse

export const TokenGuardadoSchema = z.object({
  token: z.string().min(1),
  expiraEn: z.number().int().positive(),
})
export type TokenGuardado = z.infer<typeof TokenGuardadoSchema>

export type Sesion =
  | { estado: 'cargando' }
  | { estado: 'anonimo' }
  | {
      estado: 'autenticado'
      token: string
      expiraEn: number
      usuario: UsuarioAutenticado
    }

export const LoginSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(1, 'El usuario o correo es obligatorio')
    .max(100, 'El identificador no puede superar 100 caracteres'),
  password: z
    .string()
    .min(1, 'La contraseña es obligatoria')
    .max(128, 'La contraseña no puede superar 128 caracteres'),
})
export type LoginRequest = z.infer<typeof LoginSchema>
export type LoginForm = LoginRequest

const bytesUtf8 = (valor: string): number => new TextEncoder().encode(valor).length

const esFechaPasadaOHoy = (fechaIso: string): boolean => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fechaIso)) return false
  const hoyIso = new Date().toISOString().slice(0, 10)
  return fechaIso <= hoyIso
}

export const RegistroSchema = z.object({
  username: z.string().trim().min(1, 'El nombre de usuario es obligatorio'),
  email: z.string().trim().min(1, 'El correo es obligatorio').pipe(z.email('Ingresa un correo electrónico válido')),
  firstName: z.string().trim().min(1, 'El nombre es obligatorio'),
  lastName: z.string().trim().min(1, 'El apellido es obligatorio'),
  phone: z.string().trim().optional(),
  city: z.string().trim().optional(),
  birthDate: z
    .string()
    .trim()
    .min(1, 'La fecha de nacimiento es obligatoria')
    .refine((val) => /^\d{4}-\d{2}-\d{2}$/.test(val), 'Formato de fecha inválido (YYYY-MM-DD)')
    .refine(esFechaPasadaOHoy, 'La fecha de nacimiento no puede ser futura'),
  password: z
    .string()
    .min(12, 'La contraseña debe tener entre 12 y 72 caracteres')
    .max(72, 'La contraseña debe tener entre 12 y 72 caracteres')
    .refine(
      (val) => bytesUtf8(val) <= 72,
      'La contraseña no puede superar 72 bytes en UTF-8',
    ),
})
export type RegisterUserRequest = z.infer<typeof RegistroSchema>
export type RegistroForm = RegisterUserRequest
