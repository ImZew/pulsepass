import { Link, useNavigate } from 'react-router'
import { Badge, BadgeRol } from '../../componentes/Badge'
import { Boton } from '../../componentes/Boton'
import { Cargando } from '../../componentes/Cargando'
import { EstadoError } from '../../componentes/EstadoError'
import { IconoTicket, IconoUsuario } from '../../componentes/Iconos'
import { Tarjeta } from '../../componentes/Tarjeta'
import { esApiError } from '../../lib/http'
import { RUTAS } from '../../lib/rutas'
import { useAuth } from '../auth/hooks'
import { useUsuario } from './hooks'

const COLORES_ACTIVO: Record<'activo' | 'inactivo', string> = {
  activo: 'bg-emerald-100 text-emerald-800',
  inactivo: 'bg-red-100 text-red-800',
}

export function PaginaCuenta() {
  const { sesion, cerrarSesion, tieneRol } = useAuth()
  const navigate = useNavigate()

  const usernameSesion = sesion.estado === 'autenticado' ? sesion.usuario.username : ''
  const consultaUsuario = useUsuario(usernameSesion, sesion.estado === 'autenticado')

  if (sesion.estado !== 'autenticado') {
    return null
  }

  const { usuario } = sesion
  const perfil = consultaUsuario.data

  function manejarCerrar() {
    cerrarSesion()
    void navigate(RUTAS.login)
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 py-4">
      <header className="marco-brutal bg-white p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="grid size-12 shrink-0 place-items-center border-2 border-slate-900 bg-amber-300 shadow-brutal-sm">
              <IconoUsuario className="size-6" />
            </span>
            <div>
              <p className="font-mono text-xs font-bold uppercase tracking-widest text-marca-600">
                Perfil de Usuario
              </p>
              <h1 className="font-titulo text-3xl font-extrabold uppercase">Mi cuenta</h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {usuario.roles.map((rol) => (
              <BadgeRol key={rol} rol={rol} />
            ))}
          </div>
        </div>
      </header>

      {consultaUsuario.isLoading ? (
        <Cargando variante="detalle" etiqueta="Cargando información del perfil..." />
      ) : consultaUsuario.isError ? (
        <EstadoError
          mensaje={esApiError(consultaUsuario.error) ? consultaUsuario.error.message : undefined}
          onReintentar={() => void consultaUsuario.refetch()}
        />
      ) : (
        <Tarjeta className="flex flex-col gap-6">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b-2 border-slate-900 pb-4">
            <div>
              <p className="font-mono text-xs font-bold uppercase tracking-widest text-slate-500">
                Datos sincronizados (GET /api/users/{perfil?.username ?? usuario.username})
              </p>
              <p className="mt-1 font-titulo text-2xl font-extrabold uppercase">
                {perfil?.username ?? usuario.username}
              </p>
              <p className="font-mono text-sm text-slate-600">
                {perfil?.email ?? usuario.email}
              </p>
            </div>

            {perfil !== undefined && (
              <Badge colores={COLORES_ACTIVO[perfil.active ? 'activo' : 'inactivo']}>
                {perfil.active ? 'Activo' : 'Inactivo'}
              </Badge>
            )}
          </div>

          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="border-2 border-slate-900 bg-slate-50 p-4">
              <dt className="font-mono text-xs font-bold uppercase text-slate-500">
                Nombre de usuario
              </dt>
              <dd className="mt-1 font-mono text-sm font-bold text-slate-900">
                {perfil?.username ?? usuario.username}
              </dd>
            </div>

            <div className="border-2 border-slate-900 bg-slate-50 p-4">
              <dt className="font-mono text-xs font-bold uppercase text-slate-500">
                Correo electrónico
              </dt>
              <dd className="mt-1 truncate font-mono text-sm font-bold text-slate-900">
                {perfil?.email ?? usuario.email}
              </dd>
            </div>

            <div className="border-2 border-slate-900 bg-slate-50 p-4">
              <dt className="font-mono text-xs font-bold uppercase text-slate-500">
                Roles activos
              </dt>
              <dd className="mt-1 flex flex-wrap gap-1.5">
                {usuario.roles.map((rol) => (
                  <span
                    key={rol}
                    className="border border-slate-900 bg-white px-2 py-0.5 font-mono text-xs font-bold uppercase"
                  >
                    {rol}
                  </span>
                ))}
              </dd>
            </div>
          </dl>
        </Tarjeta>
      )}

      <Tarjeta className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-3">
          {tieneRol('USER') && (
            <Link
              to={RUTAS.misTickets}
              className="inline-flex min-h-11 items-center gap-2 border-2 border-slate-900 bg-marca-600 px-5 py-2.5 font-titulo text-sm font-bold uppercase text-white shadow-brutal-sm hover:bg-marca-700"
            >
              <IconoTicket className="size-4" />
              <span>Ver mis tickets</span>
            </Link>
          )}
        </div>

        <Boton variante="peligro" onClick={manejarCerrar}>
          Cerrar sesión
        </Boton>
      </Tarjeta>
    </div>
  )
}

export default PaginaCuenta
