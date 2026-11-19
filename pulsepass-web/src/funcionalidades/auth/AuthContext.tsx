import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { borrarToken, guardarToken, leerTokenVigente } from '../../lib/almacenSesion'
import { registrarOnUnauthorized } from '../../lib/http'
import type { Rol } from '../../lib/tipos'
import { iniciarSesionApi, obtenerUsuarioActual } from './api'
import { AuthContext, type AuthContextValue } from './contexto'
import type { Sesion, UsuarioAutenticado } from './tipos'

export interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const queryClient = useQueryClient()
  const [sesion, setSesion] = useState<Sesion>(() => {
    const guardado = leerTokenVigente()
    return guardado !== null ? { estado: 'cargando' } : { estado: 'anonimo' }
  })
  const [sesionExpirada, setSesionExpirada] = useState(false)

  const cerrarSesion = useCallback(() => {
    borrarToken()
    queryClient.clear()
    setSesion({ estado: 'anonimo' })
  }, [queryClient])

  const limpiarAvisoExpiracion = useCallback(() => {
    setSesionExpirada(false)
  }, [])

  // Interceptor global 401 → cierra sesión, limpia caché y marca expiración
  useEffect(() => {
    return registrarOnUnauthorized(() => {
      borrarToken()
      queryClient.clear()
      setSesionExpirada(true)
      setSesion({ estado: 'anonimo' })
    })
  }, [queryClient])

  // Arranque silencioso: si hay token vigente en sessionStorage, rehidratar /api/auth/me
  useEffect(() => {
    let cancelado = false
    const guardado = leerTokenVigente()
    if (guardado === null) {
      return
    }

    obtenerUsuarioActual()
      .then((usuario) => {
        if (cancelado) return
        setSesion({
          estado: 'autenticado',
          token: guardado.token,
          expiraEn: guardado.expiraEn,
          usuario,
        })
      })
      .catch(() => {
        if (cancelado) return
        borrarToken()
        queryClient.clear()
        setSesion({ estado: 'anonimo' })
      })

    return () => {
      cancelado = true
    }
  }, [queryClient])

  // Temporizador local de expiración del JWT
  useEffect(() => {
    if (sesion.estado !== 'autenticado') return
    const msRestantes = Math.max(0, sesion.expiraEn - Date.now())
    const timer = window.setTimeout(() => {
      borrarToken()
      queryClient.clear()
      setSesionExpirada(true)
      setSesion({ estado: 'anonimo' })
    }, msRestantes)
    return () => window.clearTimeout(timer)
  }, [sesion, queryClient])

  const iniciarSesion = useCallback(
    async (identifier: string, password: string): Promise<UsuarioAutenticado> => {
      const respuestaAuth = await iniciarSesionApi({ identifier, password })
      const guardado = guardarToken(respuestaAuth.accessToken, respuestaAuth.expiresIn)
      try {
        const usuario = await obtenerUsuarioActual()
        setSesionExpirada(false)
        setSesion({
          estado: 'autenticado',
          token: guardado.token,
          expiraEn: guardado.expiraEn,
          usuario,
        })
        return usuario
      } catch (error) {
        borrarToken()
        queryClient.clear()
        setSesion({ estado: 'anonimo' })
        throw error
      }
    },
    [queryClient],
  )

  const tieneRol = useCallback(
    (...roles: Rol[]): boolean => {
      if (sesion.estado !== 'autenticado') return false
      return roles.some((rol) => sesion.usuario.roles.includes(rol))
    },
    [sesion],
  )

  const valor = useMemo<AuthContextValue>(
    () => ({
      sesion,
      sesionExpirada,
      limpiarAvisoExpiracion,
      iniciarSesion,
      cerrarSesion,
      tieneRol,
    }),
    [sesion, sesionExpirada, limpiarAvisoExpiracion, iniciarSesion, cerrarSesion, tieneRol],
  )

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>
}
