import { Navigate, Outlet, useLocation } from 'react-router'
import { useAuth } from '../../funcionalidades/auth/hooks'
import { RUTAS } from '../../lib/rutas'
import type { Rol } from '../../lib/tipos'
import { Cargando } from '../Cargando'

export interface RutaPorRolProps {
  rolesPermitidos?: readonly Rol[]
  roles?: readonly Rol[]
}

export function RutaPorRol({ rolesPermitidos, roles }: RutaPorRolProps) {
  const { sesion } = useAuth()
  const location = useLocation()
  const permitidos = rolesPermitidos ?? roles ?? []

  if (sesion.estado === 'cargando') {
    return <Cargando etiqueta="Verificando permisos..." />
  }

  if (sesion.estado === 'anonimo') {
    return <Navigate to={RUTAS.login} replace state={{ desde: location.pathname }} />
  }

  const autorizado = permitidos.some((rol) => sesion.usuario.roles.includes(rol))
  if (!autorizado) {
    return <Navigate to={RUTAS.sinPermisos} replace />
  }

  return <Outlet />
}

export default RutaPorRol
