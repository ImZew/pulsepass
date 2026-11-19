import { useState } from 'react'
import { Campo } from '../../componentes/Campo'
import { Cargando } from '../../componentes/Cargando'
import { EstadoError } from '../../componentes/EstadoError'
import { EstadoVacio } from '../../componentes/EstadoVacio'
import { esApiError } from '../../lib/http'
import { TarjetaSede } from './componentes/TarjetaSede'
import { useSedesActivas } from './hooks'

export function PaginaSedes() {
  const [busqueda, setBusqueda] = useState('')
  const consultaSedes = useSedesActivas()

  const termino = busqueda.trim().toLowerCase()
  const sedesFiltradas = (consultaSedes.data ?? []).filter(
    (sede) =>
      termino.length === 0 ||
      sede.name.toLowerCase().includes(termino) ||
      sede.city.toLowerCase().includes(termino) ||
      sede.code.toLowerCase().includes(termino),
  )

  return (
    <div className="flex flex-col gap-8">
      <header className="marco-brutal bg-white p-6 sm:p-8">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b-2 border-slate-900 pb-4">
          <div>
            <p className="font-mono text-xs font-bold uppercase tracking-widest text-marca-600">
              Recintos Oficiales
            </p>
            <h1 className="mt-1 font-titulo text-3xl font-extrabold uppercase sm:text-4xl">
              Sedes
            </h1>
          </div>
          {!consultaSedes.isLoading && !consultaSedes.isError && (
            <span className="border-2 border-slate-900 bg-amber-300 px-3 py-1 font-mono text-xs font-extrabold uppercase">
              {sedesFiltradas.length} {sedesFiltradas.length === 1 ? 'sede' : 'sedes'}
            </span>
          )}
        </div>

        <div className="mt-6 max-w-md">
          <Campo
            etiqueta="Filtrar por ciudad o nombre"
            type="search"
            placeholder="Ej. Santa Marta, Marina Convention..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
      </header>

      {consultaSedes.isLoading ? (
        <Cargando variante="tarjetas" cantidad={3} etiqueta="Cargando sedes..." />
      ) : consultaSedes.isError ? (
        <EstadoError
          mensaje={
            esApiError(consultaSedes.error) ? consultaSedes.error.message : undefined
          }
          onReintentar={() => void consultaSedes.refetch()}
        />
      ) : sedesFiltradas.length === 0 ? (
        <EstadoVacio
          mensaje="No se encontraron sedes"
          descripcion={
            termino.length > 0
              ? 'Prueba con otra ciudad o nombre de recinto.'
              : 'No hay sedes activas disponibles.'
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {sedesFiltradas.map((sede) => (
            <TarjetaSede key={sede.code} sede={sede} />
          ))}
        </div>
      )}
    </div>
  )
}

export default PaginaSedes
