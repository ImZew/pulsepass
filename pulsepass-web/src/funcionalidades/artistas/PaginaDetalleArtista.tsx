import { Link, useParams } from 'react-router'
import { Badge } from '../../componentes/Badge'
import { Cargando } from '../../componentes/Cargando'
import { EstadoError } from '../../componentes/EstadoError'
import { EstadoVacio } from '../../componentes/EstadoVacio'
import { IconoFlechaIzquierda } from '../../componentes/Iconos'
import { PaginaNoEncontrada } from '../../componentes/layout/PaginaNoEncontrada'
import { esApiError } from '../../lib/http'
import { RUTAS } from '../../lib/rutas'
import { TarjetaEvento } from '../eventos/componentes/TarjetaEvento'
import { useEventosPorArtista } from '../eventos/hooks'
import { useArtista } from './hooks'
import { obtenerInicialesArtista } from './iniciales'

export function PaginaDetalleArtista() {
  const { id: idParam = '' } = useParams<{ id: string }>()
  const idNumerico = Number(idParam)
  const idValido =
    /^\d+$/.test(idParam.trim()) && Number.isInteger(idNumerico) && idNumerico > 0

  const consultaArtista = useArtista(idNumerico, idValido)
  const stageName = consultaArtista.data?.stageName ?? ''
  const consultaEventos = useEventosPorArtista(stageName, stageName.length > 0)

  // PRD 9.6 / TEST-FE-ART-003: Si el id no es numérico, devuelve 404 sin llamar a la API
  if (!idValido) {
    return <PaginaNoEncontrada />
  }

  if (consultaArtista.isLoading) {
    return <Cargando variante="detalle" etiqueta="Cargando artista..." />
  }

  if (consultaArtista.isError) {
    if (esApiError(consultaArtista.error) && consultaArtista.error.status === 404) {
      return <PaginaNoEncontrada />
    }
    return (
      <EstadoError
        mensaje={
          esApiError(consultaArtista.error) ? consultaArtista.error.message : undefined
        }
        onReintentar={() => void consultaArtista.refetch()}
      />
    )
  }

  const artista = consultaArtista.data
  if (artista === undefined) {
    return null
  }

  const eventos = consultaEventos.data ?? []

  return (
    <div className="flex flex-col gap-8">
      <div>
        <Link
          to={RUTAS.artistas}
          className="inline-flex items-center gap-2 border-2 border-slate-900 bg-white px-4 py-2 font-titulo text-xs font-bold uppercase shadow-brutal-sm hover:bg-amber-300"
        >
          <IconoFlechaIzquierda className="size-4" />
          <span>Artistas</span>
        </Link>
      </div>

      {/* Cabecera brutalista del artista */}
      <section className="marco-brutal flex flex-col gap-6 bg-white p-6 sm:flex-row sm:items-center sm:p-8">
        <div
          aria-hidden="true"
          className="grid size-24 shrink-0 place-items-center border-2 border-slate-900 bg-amber-300 font-titulo text-4xl font-extrabold uppercase text-slate-900 shadow-brutal"
        >
          {obtenerInicialesArtista(artista.stageName)}
        </div>

        <div className="flex flex-1 flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="border-2 border-slate-900 bg-slate-900 px-2.5 py-0.5 font-mono text-xs font-bold text-white">
              ART-{String(artista.id).padStart(3, '0')}
            </span>
            <Badge
              colores={
                artista.active
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-slate-200 text-slate-700'
              }
            >
              {artista.active ? 'Activo' : 'Inactivo'}
            </Badge>
          </div>
          <h1 className="font-titulo text-3xl font-extrabold uppercase sm:text-5xl">
            {artista.stageName}
          </h1>
          <p className="text-sm text-slate-600">
            Artista oficial del circuito PulsePass.
          </p>
        </div>
      </section>

      {/* Próximos eventos del artista */}
      <section aria-labelledby="titulo-eventos-artista" className="flex flex-col gap-5">
        <h2
          id="titulo-eventos-artista"
          className="border-b-2 border-slate-900 pb-3 font-titulo text-2xl font-extrabold uppercase"
        >
          Próximos eventos de {artista.stageName}
        </h2>

        {consultaEventos.isLoading ? (
          <Cargando variante="tarjetas" cantidad={2} etiqueta="Cargando eventos del artista..." />
        ) : consultaEventos.isError ? (
          <EstadoError onReintentar={() => void consultaEventos.refetch()} />
        ) : eventos.length === 0 ? (
          <EstadoVacio mensaje="Sin eventos próximos" />
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {eventos.map((evento) => (
              <TarjetaEvento key={evento.eventCode} evento={evento} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export default PaginaDetalleArtista
