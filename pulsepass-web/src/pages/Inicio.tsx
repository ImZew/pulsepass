import { Link } from 'react-router'
import { useAuth } from '../funcionalidades/auth/hooks'
import { RUTAS } from '../lib/rutas'

export function Inicio() {
  const { sesion } = useAuth()

  return (
    <div className="flex flex-col gap-10">
      <section className="marco-brutal bg-linear-to-r from-marca-600 to-acento-500 p-8 text-white sm:p-12">
        <p className="font-mono text-xs font-bold uppercase tracking-widest text-amber-300">
          Cartelera Oficial · Temporada 2026
        </p>
        <h1 className="mt-2 max-w-2xl font-titulo text-3xl font-extrabold uppercase leading-tight sm:text-5xl">
          Descubre los mejores eventos
        </h1>
        <p className="mt-3 max-w-xl text-base text-white/90 sm:text-lg">
          Música, cultura, deporte y tecnología en un solo lugar.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <Link
            to={RUTAS.eventos}
            className="inline-flex min-h-11 items-center border-2 border-slate-900 bg-amber-300 px-6 py-2.5 font-titulo text-sm font-bold uppercase text-slate-900 shadow-brutal-sm hover:bg-white"
          >
            Ver cartelera
          </Link>
          {sesion.estado !== 'autenticado' && (
            <Link
              to={RUTAS.registro}
              className="inline-flex min-h-11 items-center border-2 border-slate-900 bg-white px-6 py-2.5 font-titulo text-sm font-bold uppercase text-slate-900 shadow-brutal-sm hover:bg-marca-50"
            >
              Crear cuenta
            </Link>
          )}
        </div>
      </section>
    </div>
  )
}

export default Inicio
