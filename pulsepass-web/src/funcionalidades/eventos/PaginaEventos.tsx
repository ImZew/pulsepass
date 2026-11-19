import { useSearchParams } from 'react-router'
import { Boton } from '../../componentes/Boton'
import { Campo } from '../../componentes/Campo'
import { Cargando } from '../../componentes/Cargando'
import { EstadoError } from '../../componentes/EstadoError'
import { EstadoVacio } from '../../componentes/EstadoVacio'
import { Selector, type OpcionSelector } from '../../componentes/Selector'
import { ETIQUETA_CATEGORIA } from '../../lib/etiquetas'
import { esApiError } from '../../lib/http'
import { EventCategorySchema, type EventCategory } from '../../lib/tipos'
import { useArtistasActivos } from '../artistas/hooks'
import { TarjetaEvento } from './componentes/TarjetaEvento'
import { useEventosPorArtista, useEventosPublicados } from './hooks'

const OPCIONES_CATEGORIA: readonly OpcionSelector[] = EventCategorySchema.options.map((cat) => ({
  valor: cat,
  etiqueta: ETIQUETA_CATEGORIA[cat],
}))

function parsearCategoria(valor: string | null): EventCategory | '' {
  if (!valor) return ''
  const resultado = EventCategorySchema.safeParse(valor)
  return resultado.success ? resultado.data : ''
}

export function PaginaEventos() {
  const [searchParams, setSearchParams] = useSearchParams()

  const qParam = searchParams.get('q') ?? ''
  const categoriaParam = parsearCategoria(searchParams.get('categoria'))
  const artistaParam = searchParams.get('artista') ?? ''

  const usaFiltroArtista = artistaParam.trim().length > 0
  const consultaPublicados = useEventosPublicados(!usaFiltroArtista)
  const consultaPorArtista = useEventosPorArtista(artistaParam, usaFiltroArtista)
  const consultaArtistas = useArtistasActivos()

  const consultaActiva = usaFiltroArtista ? consultaPorArtista : consultaPublicados
  const listaBase = consultaActiva.data ?? []

  const termino = qParam.trim().toLowerCase()
  const eventosFiltrados = listaBase.filter((evento) => {
    const coincideTexto =
      termino.length === 0 ||
      evento.name.toLowerCase().includes(termino) ||
      evento.venueName.toLowerCase().includes(termino) ||
      evento.eventCode.toLowerCase().includes(termino)

    // C-02: si el DTO incluye category, filtra por ella; si el backend real no la envía en el resumen, no descarta el evento
    const coincideCategoria =
      categoriaParam === '' ||
      evento.category === undefined ||
      evento.category === categoriaParam

    return coincideTexto && coincideCategoria
  })

  const opcionesArtista: OpcionSelector[] = (consultaArtistas.data ?? []).map((a) => ({
    valor: a.stageName,
    etiqueta: a.stageName,
  }))

  function actualizarParametro(clave: 'q' | 'categoria' | 'artista', valor: string) {
    const siguientes = new URLSearchParams(searchParams)
    if (valor.trim().length > 0) {
      siguientes.set(clave, valor)
    } else {
      siguientes.delete(clave)
    }
    setSearchParams(siguientes)
  }

  function limpiarFiltros() {
    setSearchParams(new URLSearchParams())
  }

  const hayFiltrosActivos =
    qParam.trim().length > 0 || categoriaParam !== '' || artistaParam.trim().length > 0

  return (
    <div className="flex flex-col gap-8">
      <header className="marco-brutal bg-white p-6 sm:p-8">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b-2 border-slate-900 pb-4">
          <div>
            <p className="font-mono text-xs font-bold uppercase tracking-widest text-marca-600">
              Programación Oficial
            </p>
            <h1 className="mt-1 font-titulo text-3xl font-extrabold uppercase sm:text-4xl">
              Cartelera
            </h1>
          </div>
          {!consultaActiva.isLoading && !consultaActiva.isError && (
            <span className="border-2 border-slate-900 bg-amber-300 px-3 py-1 font-mono text-xs font-extrabold uppercase">
              {eventosFiltrados.length}{' '}
              {eventosFiltrados.length === 1 ? 'evento' : 'eventos'}
            </span>
          )}
        </div>

        {/* Barra de filtros sincronizada con la URL */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:items-end">
          <Campo
            etiqueta="Buscar evento"
            type="search"
            placeholder="Buscar por nombre o sede..."
            value={qParam}
            onChange={(e) => actualizarParametro('q', e.target.value)}
          />

          <Selector
            etiqueta="Categoría"
            marcador="Todas las categorías"
            opciones={OPCIONES_CATEGORIA}
            value={categoriaParam}
            onChange={(e) => actualizarParametro('categoria', e.target.value)}
          />

          <Selector
            etiqueta="Artista"
            marcador="Todos los artistas"
            opciones={opcionesArtista}
            value={artistaParam}
            onChange={(e) => actualizarParametro('artista', e.target.value)}
          />

          <div>
            <Boton
              variante="secundario"
              anchoCompleto
              disabled={!hayFiltrosActivos}
              onClick={limpiarFiltros}
            >
              Limpiar filtros
            </Boton>
          </div>
        </div>
      </header>

      {consultaActiva.isLoading ? (
        <Cargando variante="tarjetas" cantidad={6} etiqueta="Cargando cartelera..." />
      ) : consultaActiva.isError ? (
        <EstadoError
          mensaje={
            esApiError(consultaActiva.error) ? consultaActiva.error.message : undefined
          }
          onReintentar={() => void consultaActiva.refetch()}
        />
      ) : eventosFiltrados.length === 0 ? (
        <EstadoVacio
          mensaje={
            hayFiltrosActivos
              ? 'Sin resultados para tu búsqueda'
              : 'Aún no hay eventos publicados'
          }
          descripcion={
            hayFiltrosActivos
              ? 'Prueba con otro término o limpia los filtros activos.'
              : 'No hay eventos publicados en este momento.'
          }
          accion={
            hayFiltrosActivos ? (
              <Boton variante="secundario" onClick={limpiarFiltros}>
                Limpiar filtros
              </Boton>
            ) : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {eventosFiltrados.map((evento) => (
            <TarjetaEvento key={evento.eventCode} evento={evento} />
          ))}
        </div>
      )}
    </div>
  )
}

export default PaginaEventos
