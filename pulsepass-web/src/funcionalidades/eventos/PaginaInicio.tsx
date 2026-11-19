import { Link } from 'react-router'
import { Cargando } from '../../componentes/Cargando'
import { EstadoError } from '../../componentes/EstadoError'
import { EstadoVacio } from '../../componentes/EstadoVacio'
import {
  IconoFlechaDerecha,
  IconoMusica,
  IconoSede,
  IconoTicket,
} from '../../componentes/Iconos'
import { TarjetaArtista } from '../artistas/componentes/TarjetaArtista'
import { useArtistasActivos } from '../artistas/hooks'
import { useAuth } from '../auth/hooks'
import { esApiError } from '../../lib/http'
import { RUTAS } from '../../lib/rutas'
import { TarjetaEvento } from './componentes/TarjetaEvento'
import { useEventosPublicados } from './hooks'

export function PaginaInicio() {
  const { sesion } = useAuth()
  const consultaEventos = useEventosPublicados()
  const consultaArtistas = useArtistasActivos()

  const eventosDestacados = (consultaEventos.data ?? []).slice(0, 3)
  const artistasDestacados = (consultaArtistas.data ?? []).slice(0, 6)

  return (
    <div className="flex flex-col gap-14">
      {/* HERO CINEMATOGRÁFICO NEO-BRUTALISTA */}
      <section className="marco-brutal relative overflow-hidden bg-linear-to-r from-marca-600 to-acento-500 text-white">
        {/* Cinta superior estilo cartelera underground */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-slate-900 bg-slate-900 px-5 py-2 font-mono text-[11px] font-bold uppercase tracking-widest text-amber-300">
          <span>PULSEPASS // EDICIÓN FESTIVAL & CULTURA EN VIVO</span>
          <span>MUSIC · SPORTS · TECHNOLOGY · CULTURE · ENTERTAINMENT</span>
        </div>

        <div className="grid gap-8 p-6 sm:p-10 lg:grid-cols-12 lg:items-center">
          <div className="flex flex-col gap-5 lg:col-span-7">
            <span className="inline-flex w-fit items-center gap-2 border-2 border-slate-900 bg-amber-300 px-3 py-1 font-mono text-xs font-extrabold uppercase tracking-wider text-slate-900 shadow-brutal-sm">
              <IconoMusica className="size-4" />
              Temporada 2026 · Accesos Verificados
            </span>

            <h1 className="font-titulo text-4xl font-extrabold uppercase leading-none tracking-tight sm:text-6xl">
              Descubre los mejores eventos
            </h1>

            <p className="max-w-xl border-l-4 border-amber-300 pl-4 text-base font-medium text-white/95 sm:text-lg">
              Música, cultura, deporte y tecnología en un solo lugar. Boletos digitales con código
              único verificable en puerta.
            </p>

            <div className="mt-2 flex flex-wrap items-center gap-4">
              <Link
                to={RUTAS.eventos}
                className="inline-flex min-h-12 items-center gap-2 border-2 border-slate-900 bg-amber-300 px-6 py-3 font-titulo text-sm font-extrabold uppercase tracking-wide text-slate-900 shadow-brutal transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-white"
              >
                <span>Ver cartelera</span>
                <IconoFlechaDerecha className="size-4" />
              </Link>

              {sesion.estado !== 'autenticado' && (
                <Link
                  to={RUTAS.registro}
                  className="inline-flex min-h-12 items-center border-2 border-slate-900 bg-white px-6 py-3 font-titulo text-sm font-extrabold uppercase tracking-wide text-slate-900 shadow-brutal transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-marca-50"
                >
                  Crear cuenta
                </Link>
              )}
            </div>
          </div>

          {/* Bloque visual 3D: Boleto físico conmemorativo */}
          <div className="escena-3d lg:col-span-5">
            <div className="boleto-3d border-2 border-slate-900 bg-white p-5 text-slate-900 shadow-brutal-lg">
              <div className="flex items-center justify-between border-b-2 border-dashed border-slate-900 pb-3">
                <span className="border-2 border-slate-900 bg-slate-900 px-2.5 py-0.5 font-mono text-xs font-bold text-amber-300">
                  PASE-2026
                </span>
                <span className="font-mono text-xs font-extrabold uppercase tracking-widest text-marca-600">
                  ACCESO OFICIAL
                </span>
              </div>

              <div className="py-4">
                <p className="font-mono text-[11px] font-bold uppercase tracking-widest text-slate-500">
                  CIRCUITO NACIONAL
                </p>
                <p className="mt-1 font-titulo text-2xl font-extrabold uppercase leading-tight">
                  CARTELERA EN VIVO PULSEPASS
                </p>
                <p className="mt-2 font-mono text-xs font-semibold text-slate-600">
                  BOGOTÁ · SANTA MARTA · MEDELLÍN · BARRANQUILLA
                </p>
              </div>

              <div className="flex items-center justify-between border-t-2 border-slate-900 bg-amber-300 px-3 py-2 font-mono text-xs font-extrabold uppercase">
                <span className="inline-flex items-center gap-1.5">
                  <IconoTicket className="size-4" />
                  VERIFICACIÓN ANTI-FRAUDE
                </span>
                <span>100% DIGITAL</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRÓXIMOS EVENTOS DESTACADOS */}
      <section aria-labelledby="titulo-proximos-eventos" className="flex flex-col gap-6">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b-2 border-slate-900 pb-3">
          <div>
            <p className="font-mono text-xs font-bold uppercase tracking-widest text-marca-600">
              Selección Oficial
            </p>
            <h2
              id="titulo-proximos-eventos"
              className="font-titulo text-2xl font-extrabold uppercase sm:text-3xl"
            >
              Próximos eventos
            </h2>
          </div>
          <Link
            to={RUTAS.eventos}
            className="inline-flex items-center gap-1.5 border-2 border-slate-900 bg-white px-4 py-2 font-titulo text-xs font-bold uppercase shadow-brutal-sm hover:bg-amber-300"
          >
            <span>Ver todos</span>
            <IconoFlechaDerecha className="size-4" />
          </Link>
        </div>

        {consultaEventos.isLoading ? (
          <Cargando variante="tarjetas" cantidad={3} etiqueta="Cargando próximos eventos..." />
        ) : consultaEventos.isError ? (
          <EstadoError
            mensaje={
              esApiError(consultaEventos.error)
                ? consultaEventos.error.message
                : undefined
            }
            onReintentar={() => void consultaEventos.refetch()}
          />
        ) : eventosDestacados.length === 0 ? (
          <EstadoVacio
            mensaje="Aún no hay eventos publicados"
            descripcion="Vuelve pronto para descubrir las próximas fechas confirmadas en nuestra cartelera."
          />
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {eventosDestacados.map((evento) => (
              <TarjetaEvento key={evento.eventCode} evento={evento} />
            ))}
          </div>
        )}
      </section>

      {/* ARTISTAS DESTACADOS */}
      <section aria-labelledby="titulo-artistas-destacados" className="flex flex-col gap-6">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b-2 border-slate-900 pb-3">
          <div>
            <p className="font-mono text-xs font-bold uppercase tracking-widest text-acento-500">
              Talento en Escena
            </p>
            <h2
              id="titulo-artistas-destacados"
              className="font-titulo text-2xl font-extrabold uppercase sm:text-3xl"
            >
              Artistas destacados
            </h2>
          </div>
          <Link
            to={RUTAS.artistas}
            className="inline-flex items-center gap-1.5 border-2 border-slate-900 bg-white px-4 py-2 font-titulo text-xs font-bold uppercase shadow-brutal-sm hover:bg-amber-300"
          >
            <span>Ver todos los artistas</span>
            <IconoFlechaDerecha className="size-4" />
          </Link>
        </div>

        {consultaArtistas.isLoading ? (
          <Cargando variante="tarjetas" cantidad={3} etiqueta="Cargando artistas..." />
        ) : consultaArtistas.isError ? (
          <EstadoError onReintentar={() => void consultaArtistas.refetch()} />
        ) : artistasDestacados.length === 0 ? (
          <EstadoVacio mensaje="No hay artistas activos registrados" />
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {artistasDestacados.map((artista) => (
              <TarjetaArtista key={artista.id} artista={artista} />
            ))}
          </div>
        )}
      </section>

      {/* BANNER EDITORIAL A SEDES */}
      <section className="marco-brutal flex flex-col items-start justify-between gap-4 bg-amber-300 p-6 sm:flex-row sm:items-center sm:p-8">
        <div className="flex items-start gap-4">
          <div className="grid size-12 shrink-0 place-items-center border-2 border-slate-900 bg-white shadow-brutal-sm">
            <IconoSede className="size-6 text-acento-500" />
          </div>
          <div>
            <p className="font-mono text-xs font-bold uppercase tracking-widest text-slate-800">
              Recintos & Escenarios
            </p>
            <h2 className="font-titulo text-2xl font-extrabold uppercase text-slate-900">
              Explora las sedes oficiales y su capacidad
            </h2>
          </div>
        </div>
        <Link
          to={RUTAS.sedes}
          className="inline-flex min-h-11 items-center gap-2 border-2 border-slate-900 bg-slate-900 px-5 py-2.5 font-titulo text-sm font-bold uppercase text-white shadow-brutal-sm hover:bg-marca-600"
        >
          <span>Explorar sedes</span>
          <IconoFlechaDerecha className="size-4" />
        </Link>
      </section>
    </div>
  )
}

export default PaginaInicio
