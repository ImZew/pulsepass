import { Navigate, Outlet, useLocation } from 'react-router'
import { useAuth } from '../../funcionalidades/auth/hooks'
import { RUTAS } from '../../lib/rutas'
import { Cargando } from '../Cargando'

interface EstadoDesde {
  desde?: string
}

function obtenerDestino(state: unknown): string {
  if (typeof state === 'object' && state !== null && 'desde' in state) {
    const desde = (state as EstadoDesde).desde
    if (typeof desde === 'string' && desde.startsWith('/')) {
      return desde
    }
  }
  return RUTAS.inicio
}

export function SoloAnonimo() {
  const { sesion } = useAuth()
  const location = useLocation()

  if (sesion.estado === 'cargando') {
    return <Cargando etiqueta="Verificando sesión..." />
  }

  if (sesion.estado === 'autenticado') {
    return <Navigate to={obtenerDestino(location.state)} replace />
  }

  return <Outlet />
}

export default SoloAnonimo
