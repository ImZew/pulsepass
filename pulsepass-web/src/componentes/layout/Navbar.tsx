import { clsx } from 'clsx'
import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router'
import { useAuth } from '../../funcionalidades/auth/hooks'
import { RUTAS } from '../../lib/rutas'
import { BadgeRol } from '../Badge'
import { Boton } from '../Boton'
import { IconoCerrar, IconoMenu, IconoMusica, IconoUsuario } from '../Iconos'

interface EnlaceNavegacion {
  etiqueta: string
  ruta: string
}

const ENLACES_PUBLICOS: readonly EnlaceNavegacion[] = [
  { etiqueta: 'Eventos', ruta: RUTAS.eventos },
  { etiqueta: 'Artistas', ruta: RUTAS.artistas },
  { etiqueta: 'Sedes', ruta: RUTAS.sedes },
]

function claseNavLink(isActive: boolean): string {
  return clsx(
    'inline-flex min-h-10 items-center border-2 px-3 py-1.5 font-titulo text-sm font-bold uppercase tracking-wide transition-colors',
    isActive
      ? 'border-slate-900 bg-amber-300 text-slate-900 shadow-brutal-sm'
      : 'border-transparent text-slate-900 hover:border-slate-900 hover:bg-marca-50',
  )
}

export function Navbar() {
  const { sesion, cerrarSesion, tieneRol } = useAuth()
  const navigate = useNavigate()
  const [menuAbierto, setMenuAbierto] = useState(false)

  const esUser = tieneRol('USER')
  const esStaffOAdmin = tieneRol('STAFF', 'ADMIN')
  const esAdmin = tieneRol('ADMIN')

  const enlacesRol: EnlaceNavegacion[] = []
  if (esUser) {
    enlacesRol.push({ etiqueta: 'Mis tickets', ruta: RUTAS.misTickets })
  }
  if (esStaffOAdmin) {
    enlacesRol.push({ etiqueta: 'Validar ingreso', ruta: RUTAS.staffValidacion })
    enlacesRol.push({
      etiqueta: 'Tickets pagados',
      ruta: RUTAS.staffTicketsEvento('CMF-2026'),
    })
  }
  if (esAdmin) {
    enlacesRol.push({ etiqueta: 'Administrar eventos', ruta: RUTAS.adminEventos })
  }

  function manejarCerrarSesion() {
    setMenuAbierto(false)
    cerrarSesion()
    void navigate(RUTAS.login)
  }

  const todosEnlaces = [...ENLACES_PUBLICOS, ...enlacesRol]

  return (
    <header className="sticky top-0 z-40 border-b-2 border-slate-900 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <NavLink
          to={RUTAS.inicio}
          end
          onClick={() => setMenuAbierto(false)}
          className="inline-flex items-center gap-2 border-2 border-slate-900 bg-marca-600 px-3 py-1.5 font-titulo text-lg font-extrabold uppercase tracking-tight text-white shadow-brutal-sm"
        >
          <IconoMusica className="size-5" />
          <span>PulsePass</span>
        </NavLink>

        {/* Navegación de escritorio */}
        <nav aria-label="Principal" className="hidden items-center gap-2 md:flex">
          {todosEnlaces.map((enlace) => (
            <NavLink
              key={enlace.ruta}
              to={enlace.ruta}
              className={({ isActive }) => claseNavLink(isActive)}
            >
              {enlace.etiqueta}
            </NavLink>
          ))}
        </nav>

        {/* Acciones de sesión en escritorio */}
        <div className="hidden items-center gap-3 md:flex">
          {sesion.estado === 'autenticado' ? (
            <>
              <NavLink
                to={RUTAS.cuenta}
                className={({ isActive }) =>
                  clsx(
                    'inline-flex min-h-10 items-center gap-2 border-2 border-slate-900 px-3 py-1.5 font-mono text-xs font-bold uppercase shadow-brutal-sm',
                    isActive ? 'bg-amber-300 text-slate-900' : 'bg-white text-slate-900 hover:bg-marca-50',
                  )
                }
              >
                <IconoUsuario className="size-4" />
                <span>{sesion.usuario.username}</span>
                {sesion.usuario.roles[0] !== undefined && (
                  <BadgeRol rol={sesion.usuario.roles[0]} />
                )}
              </NavLink>
              <Boton variante="secundario" onClick={manejarCerrarSesion}>
                Cerrar sesión
              </Boton>
            </>
          ) : (
            <>
              <Link
                to={RUTAS.login}
                className="inline-flex min-h-11 items-center border-2 border-slate-900 bg-white px-4 py-2 font-titulo text-sm font-bold uppercase shadow-brutal-sm hover:bg-marca-50"
              >
                Iniciar sesión
              </Link>
              <Link
                to={RUTAS.registro}
                className="inline-flex min-h-11 items-center border-2 border-slate-900 bg-acento-500 px-4 py-2 font-titulo text-sm font-bold uppercase text-white shadow-brutal-sm hover:bg-acento-600"
              >
                Registrarse
              </Link>
            </>
          )}
        </div>

        {/* Botón hamburguesa móvil */}
        <button
          type="button"
          aria-expanded={menuAbierto}
          aria-controls="menu-movil-principal"
          aria-label="Menú de navegación"
          onClick={() => setMenuAbierto((prev) => !prev)}
          className="grid size-11 place-items-center border-2 border-slate-900 bg-white shadow-brutal-sm md:hidden"
        >
          {menuAbierto ? <IconoCerrar className="size-5" /> : <IconoMenu className="size-5" />}
        </button>
      </div>

      {/* Menú desplegable móvil */}
      {menuAbierto && (
        <nav
          id="menu-movil-principal"
          aria-label="Menú móvil"
          className="border-t-2 border-slate-900 bg-white px-4 py-4 md:hidden"
        >
          <div className="flex flex-col gap-2">
            {todosEnlaces.map((enlace) => (
              <NavLink
                key={enlace.ruta}
                to={enlace.ruta}
                onClick={() => setMenuAbierto(false)}
                className={({ isActive }) => claseNavLink(isActive)}
              >
                {enlace.etiqueta}
              </NavLink>
            ))}
          </div>

          <div className="mt-4 flex flex-col gap-2 border-t-2 border-slate-900 pt-4">
            {sesion.estado === 'autenticado' ? (
              <>
                <NavLink
                  to={RUTAS.cuenta}
                  onClick={() => setMenuAbierto(false)}
                  className={({ isActive }) => claseNavLink(isActive)}
                >
                  Mi cuenta ({sesion.usuario.username})
                </NavLink>
                <Boton variante="secundario" anchoCompleto onClick={manejarCerrarSesion}>
                  Cerrar sesión
                </Boton>
              </>
            ) : (
              <>
                <Link
                  to={RUTAS.login}
                  onClick={() => setMenuAbierto(false)}
                  className="inline-flex min-h-11 items-center justify-center border-2 border-slate-900 bg-white px-4 py-2 font-titulo text-sm font-bold uppercase shadow-brutal-sm"
                >
                  Iniciar sesión
                </Link>
                <Link
                  to={RUTAS.registro}
                  onClick={() => setMenuAbierto(false)}
                  className="inline-flex min-h-11 items-center justify-center border-2 border-slate-900 bg-acento-500 px-4 py-2 font-titulo text-sm font-bold uppercase text-white shadow-brutal-sm"
                >
                  Registrarse
                </Link>
              </>
            )}
          </div>
        </nav>
      )}
    </header>
  )
}
