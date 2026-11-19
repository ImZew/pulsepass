import { Link, useParams } from 'react-router'
import { Badge } from '../../componentes/Badge'
import { Cargando } from '../../componentes/Cargando'
import { CodigoTexto } from '../../componentes/CodigoTexto'
import { EstadoError } from '../../componentes/EstadoError'
import { IconoFlechaIzquierda, IconoSede } from '../../componentes/Iconos'
import { PaginaNoEncontrada } from '../../componentes/layout/PaginaNoEncontrada'
import { Tarjeta } from '../../componentes/Tarjeta'
import { esApiError } from '../../lib/http'
import { RUTAS } from '../../lib/rutas'
import { useSede } from './hooks'

export function PaginaDetalleSede() {
  const { code = '' } = useParams<{ code: string }>()
  const consultaSede = useSede(code)

  if (consultaSede.isLoading) {
    return <Cargando variante="detalle" etiqueta="Cargando sede..." />
  }

  if (consultaSede.isError) {
    if (esApiError(consultaSede.error) && consultaSede.error.status === 404) {
      return <PaginaNoEncontrada />
    }
    return (
      <EstadoError
        mensaje={
          esApiError(consultaSede.error) ? consultaSede.error.message : undefined
        }
        onReintentar={() => void consultaSede.refetch()}
      />
    )
  }

  const sede = consultaSede.data
  if (sede === undefined) {
    return null
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <Link
          to={RUTAS.sedes}
          className="inline-flex items-center gap-2 border-2 border-slate-900 bg-white px-4 py-2 font-titulo text-xs font-bold uppercase shadow-brutal-sm hover:bg-amber-300"
        >
          <IconoFlechaIzquierda className="size-4" />
          <span>Sedes</span>
        </Link>
      </div>

      <Tarjeta className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-slate-900 pb-4">
          <CodigoTexto codigo={sede.code} copiable />
          <Badge
            colores={
              sede.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
            }
          >
            {sede.active ? 'Activa' : 'Inactiva'}
          </Badge>
        </div>

        <div>
          <h1 className="font-titulo text-3xl font-extrabold uppercase sm:text-4xl">
            {sede.name}
          </h1>
          <p className="mt-2 flex items-center gap-2 text-base font-semibold text-slate-700">
            <IconoSede className="size-5 text-acento-500" />
            <span>{sede.city}</span>
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 border-t-2 border-slate-900 pt-5 sm:grid-cols-2">
          <div className="border-2 border-slate-900 bg-amber-300 p-4 shadow-brutal-sm">
            <p className="font-mono text-xs font-bold uppercase tracking-widest text-slate-800">
              Capacidad Oficial
            </p>
            <p className="mt-1 font-titulo text-2xl font-extrabold uppercase text-slate-900">
              Capacidad: {sede.capacity} personas
            </p>
          </div>

          <div className="border-2 border-slate-900 bg-slate-50 p-4 shadow-brutal-sm">
            <p className="font-mono text-xs font-bold uppercase tracking-widest text-slate-600">
              Ciudad / Ubicación
            </p>
            <p className="mt-1 font-titulo text-2xl font-extrabold uppercase text-slate-900">
              {sede.city}
            </p>
          </div>
        </div>
      </Tarjeta>
    </div>
  )
}

export default PaginaDetalleSede
