import { isRouteErrorResponse, Link, useRouteError } from 'react-router'
import { Boton } from '../componentes/Boton'
import { Tarjeta } from '../componentes/Tarjeta'
import { esApiError, MENSAJE_ERROR_GENERICO } from '../lib/http'
import { RUTAS } from '../lib/rutas'

export function ErrorPagina() {
  const error = useRouteError()

  let codigo = 'ERROR'
  let mensaje = MENSAJE_ERROR_GENERICO

  if (isRouteErrorResponse(error)) {
    codigo = String(error.status)
    if (error.status === 404) {
      mensaje = 'No encontramos esta página'
    } else if (error.status === 403) {
      mensaje = 'No tienes permisos para acceder a esta sección.'
    }
  } else if (esApiError(error)) {
    codigo = error.status > 0 ? String(error.status) : 'RED'
    mensaje = error.message
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <Tarjeta className="flex flex-col items-center gap-4 text-center">
        <span className="border-2 border-slate-900 bg-red-600 px-4 py-1 font-mono text-xl font-extrabold text-white shadow-brutal-sm">
          {codigo}
        </span>
        <h1 className="font-titulo text-2xl font-extrabold uppercase">¡Ups! Algo salió mal.</h1>
        <p className="text-slate-700">{mensaje}</p>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
          <Boton variante="secundario" onClick={() => window.location.reload()}>
            Reintentar
          </Boton>
          <Link
            to={RUTAS.inicio}
            className="inline-flex min-h-11 items-center border-2 border-slate-900 bg-marca-600 px-5 py-2.5 font-titulo text-sm font-bold uppercase text-white shadow-brutal-sm hover:bg-marca-700"
          >
            Volver al inicio
          </Link>
        </div>
      </Tarjeta>
    </div>
  )
}

export default ErrorPagina
