import { Link } from 'react-router'
import { RUTAS } from '../../lib/rutas'
import { Tarjeta } from '../Tarjeta'

export function PaginaProhibido() {
  return (
    <div className="mx-auto max-w-lg py-12">
      <Tarjeta className="flex flex-col items-center gap-4 text-center">
        <span className="border-2 border-slate-900 bg-red-600 px-4 py-1 font-mono text-2xl font-extrabold text-white shadow-brutal-sm">
          403
        </span>
        <h1 className="font-titulo text-2xl font-extrabold uppercase">
          No tienes permisos para acceder a esta sección.
        </h1>
        <p className="text-slate-600">
          Tu cuenta actual no cuenta con el rol requerido para realizar esta operación.
        </p>
        <Link
          to={RUTAS.inicio}
          className="mt-2 inline-flex min-h-11 items-center border-2 border-slate-900 bg-marca-600 px-5 py-2.5 font-titulo text-sm font-bold uppercase text-white shadow-brutal-sm hover:bg-marca-700"
        >
          Volver al inicio
        </Link>
      </Tarjeta>
    </div>
  )
}

export default PaginaProhibido
