import { createContext } from 'react'
import type { Rol } from '../../lib/tipos'
import type { Sesion, UsuarioAutenticado } from './tipos'

export interface AuthContextValue {
  sesion: Sesion
  sesionExpirada: boolean
  limpiarAvisoExpiracion: () => void
  iniciarSesion: (identifier: string, password: string) => Promise<UsuarioAutenticado>
  cerrarSesion: () => void
  tieneRol: (...roles: Rol[]) => boolean
}

export const AuthContext = createContext<AuthContextValue | null>(null)
