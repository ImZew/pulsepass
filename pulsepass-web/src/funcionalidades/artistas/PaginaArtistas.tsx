import { useState } from 'react'
import { Boton } from '../../componentes/Boton'
import { Campo } from '../../componentes/Campo'
import { Cargando } from '../../componentes/Cargando'
import { EstadoError } from '../../componentes/EstadoError'
import { EstadoVacio } from '../../componentes/EstadoVacio'
import { esApiError } from '../../lib/http'
import { TarjetaArtista } from './componentes/TarjetaArtista'
import { useArtistaPorNombre, useArtistasActivos } from './hooks'

export function PaginaArtistas() {
  const [busqueda, setBusqueda] = useState('')
  const [nombreExacto, setNombreExacto] = useState('')

  const consultaActivos = useArtistasActivos()
  const consultaExacta = useArtistaPorNombre(nombreExacto)

  const termino = busqueda.trim().toLowerCase()
  const artistasFiltrados = (consultaActivos.data ?? []).filter((artista) =>
    termino.length === 0 ? true : artista.stageName.toLowerCase().includes(termino),
  )

  function manejarBusquedaExacta() {
    setNombreExacto(busqueda.trim())
  }

  function limpiarBusqueda() {
    setBusqueda('')
    setNombreExacto('')
  }

  return (
    <div className="flex flex-col gap-8">
      <header className="marco-brutal bg-white p-6 sm:p-8">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b-2 border-slate-900 pb-4">
          <div>
            <p className="font-mono text-xs font-bold uppercase tracking-widest text-acento-500">
              Lineup & Talento
            </p>
            <h1 className="mt-1 font-titulo text-3xl font-extrabold uppercase sm:text-4xl">
              Artistas
            </h1>
          </div>
          {!consultaActivos.isLoading && !consultaActivos.isError && (
            <span className="border-2 border-slate-900 bg-amber-300 px-3 py-1 font-mono text-xs font-extrabold uppercase">
              {artistasFiltrados.length}{' '}
              {artistasFiltrados.length === 1 ? 'artista' : 'artistas'}
            </span>
          )}
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <Campo
              etiqueta="Buscar artista"
              type="search"
              placeholder="Ej. Solar Beat, Bomba Estéreo..."
              value={busqueda}
              onChange={(e) => {
                setBusqueda(e.target.value)
                if (e.target.value.trim().length === 0) {
                  setNombreExacto('')
                }
              }}
            />
          </div>
          <div className="flex gap-2">
            <Boton
              variante="secundario"
              disabled={busqueda.trim().length === 0}
              onClick={manejarBusquedaExacta}
            >
              Buscar exacto
            </Boton>
            {(busqueda.trim().length > 0 || nombreExacto.length > 0) && (
              <Boton variante="fantasma" onClick={limpiarBusqueda}>
                Limpiar
              </Boton>
            )}
          </div>
        </div>
      </header>

      {/* Resultado de búsqueda exacta por stageName (GET /api/artists/by-stage-name) */}
      {nombreExacto.length > 0 && (
        <section className="flex flex-col gap-4">
          <h2 className="font-titulo text-lg font-extrabold uppercase">
            Resultado exacto para &ldquo;{nombreExacto}&rdquo;
          </h2>
          {consultaExacta.isLoading ? (
            <Cargando variante="tarjetas" cantidad={1} etiqueta="Buscando artista..." />
          ) : consultaExacta.isError ? (
            <EstadoVacio mensaje="No se encontró un artista con ese nombre artístico exacto" />
          ) : consultaExacta.data ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <TarjetaArtista artista={consultaExacta.data} />
            </div>
          ) : null}
        </section>
      )}

      {consultaActivos.isLoading ? (
        <Cargando variante="tarjetas" cantidad={6} etiqueta="Cargando artistas..." />
      ) : consultaActivos.isError ? (
        <EstadoError
          mensaje={
            esApiError(consultaActivos.error) ? consultaActivos.error.message : undefined
          }
          onReintentar={() => void consultaActivos.refetch()}
        />
      ) : artistasFiltrados.length === 0 ? (
        <EstadoVacio
          mensaje="Sin artistas para mostrar"
          descripcion={
            termino.length > 0
              ? 'Ningún artista coincide con tu filtro actual.'
              : 'No hay artistas activos registrados.'
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {artistasFiltrados.map((artista) => (
            <TarjetaArtista key={artista.id} artista={artista} />
          ))}
        </div>
      )}
    </div>
  )
}

export default PaginaArtistas
