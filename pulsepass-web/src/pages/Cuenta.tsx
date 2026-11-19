import { Link, useNavigate } from 'react-router'
import { BadgeRol } from '../componentes/Badge'
import { Boton } from '../componentes/Boton'
import { Tarjeta } from '../componentes/Tarjeta'
import { useAuth } from '../funcionalidades/auth/hooks'
import { RUTAS } from '../lib/rutas'

export function Cuenta() {
  const { sesion, cerrarSesion, tieneRol } = useAuth()
  const navigate = useNavigate()

  if (sesion.estado !== 'autenticado') {
    return null
  }

  const { usuario } = sesion

  function manejarCerrar() {
    cerrarSesion()
    void navigate(RUTAS.login)
  }

  return (
    <div className="mx-auto max-w-2xl py-6">
      <h1 className="mb-6 font-titulo text-3xl font-extrabold uppercase">Mi cuenta</h1>
      <Tarjeta className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-slate-900 pb-4">
          <div>
            <p className="font-titulo text-2xl font-extrabold uppercase">{usuario.username}</p>
            <p className="font-mono text-sm text-slate-600">{usuario.email}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {usuario.roles.map((rol) => (
              <BadgeRol key={rol} rol={rol} />
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          {tieneRol('USER') && (
            <Link
              to={RUTAS.misTickets}
              className="inline-flex min-h-11 items-center border-2 border-slate-900 bg-marca-600 px-5 py-2.5 font-titulo text-sm font-bold uppercase text-white shadow-brutal-sm hover:bg-marca-700"
            >
              Ver mis tickets
            </Link>
          )}
          <Boton variante="peligro" onClick={manejarCerrar}>
            Cerrar sesión
          </Boton>
        </div>
      </Tarjeta>
    </div>
  )
}

export default Cuenta
