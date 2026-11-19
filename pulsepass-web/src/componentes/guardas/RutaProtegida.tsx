import { Navigate, Outlet, useLocation } from 'react-router'
import { useAuth } from '../../funcionalidades/auth/hooks'
import { RUTAS } from '../../lib/rutas'
import { Cargando } from '../Cargando'

export function RutaProtegida() {
  const { sesion, sesionExpirada } = useAuth()
  const location = useLocation()

  if (sesion.estado === 'cargando') {
    return <Cargando etiqueta="Verificando sesión..." />
  }

  if (sesion.estado === 'anonimo') {
    return (
      <Navigate
        to={RUTAS.login}
        replace
        state={{
          desde: location.pathname,
          motivo: sesionExpirada ? 'expirada' : undefined,
        }}
      />
    )
  }

  return <Outlet />
}

export default RutaProtegida
