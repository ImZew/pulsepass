import { clsx } from 'clsx'
import { useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router'
import { BadgeCategoria, BadgeEstadoEvento } from '../../componentes/Badge'
import { Boton } from '../../componentes/Boton'
import { Cargando } from '../../componentes/Cargando'
import { CodigoTexto } from '../../componentes/CodigoTexto'
import { EstadoError } from '../../componentes/EstadoError'
import { EstadoVacio } from '../../componentes/EstadoVacio'
import {
  IconoCalendario,
  IconoFlechaIzquierda,
  IconoSede,
  IconoTicket,
} from '../../componentes/Iconos'
import { Tarjeta } from '../../componentes/Tarjeta'
import { ETIQUETA_TIPO_TICKET } from '../../lib/etiquetas'
import { formatearFechaEvento } from '../../lib/formato'
import { esApiError } from '../../lib/http'
import { RUTAS } from '../../lib/rutas'
import { TicketTypeSchema, type TicketType } from '../../lib/tipos'
import { obtenerInicialesArtista } from '../artistas/iniciales'
import { useAuth } from '../auth/hooks'
import { useSede } from '../sedes/hooks'
import { ModalCompraTicket } from '../tickets/ModalCompraTicket'
import { useEvento } from './hooks'

export function PaginaDetalleEvento() {
  const { eventCode = '' } = useParams<{ eventCode: string }>()
  const [searchParams, setSearchParams] = useSearchParams()
  const { sesion, tieneRol } = useAuth()
  const navigate = useNavigate()
  const [tipoSeleccionado, setTipoSeleccionado] = useState<TicketType>('GENERAL')

  const comprarParam = searchParams.get('comprar')
  const tipoDesdeUrl = TicketTypeSchema.safeParse(comprarParam)
  const tipoInicialModal: TicketType = tipoDesdeUrl.success
    ? tipoDesdeUrl.data
    : tipoSeleccionado

  function cerrarModalCompra() {
    const siguientes = new URLSearchParams(searchParams)
    siguientes.delete('comprar')
    setSearchParams(siguientes, { replace: true })
  }

  const consultaEvento = useEvento(eventCode)
  const venueCode = consultaEvento.data?.venueCode ?? ''
  const consultaSede = useSede(venueCode, venueCode.length > 0)

  if (consultaEvento.isLoading) {
    return <Cargando variante="detalle" etiqueta="Cargando detalle del evento..." />
  }

  if (consultaEvento.isError) {
    if (
      esApiError(consultaEvento.error) &&
      (consultaEvento.error.status === 404 || consultaEvento.error.status === 403)
    ) {
      return (
        <EstadoVacio
          mensaje="Evento no disponible"
          descripcion="El evento solicitado no existe o aún no se encuentra publicado."
          accion={
            <Link
              to={RUTAS.eventos}
              className="inline-flex min-h-11 items-center border-2 border-slate-900 bg-marca-600 px-5 py-2.5 font-titulo text-sm font-bold uppercase text-white shadow-brutal-sm hover:bg-marca-700"
            >
              Volver a la cartelera
            </Link>
          }
        />
      )
    }

    return (
      <EstadoError
        mensaje={
          esApiError(consultaEvento.error) ? consultaEvento.error.message : undefined
        }
        onReintentar={() => void consultaEvento.refetch()}
      />
    )
  }

  const evento = consultaEvento.data
  if (evento === undefined) {
    return null
  }

  const sede = consultaSede.data
  const estaPublicado = evento.status === 'PUBLISHED'
  const esStaffOAdminSinUser =
    sesion.estado === 'autenticado' && !tieneRol('USER') && tieneRol('STAFF', 'ADMIN')

  return (
    <div className="flex flex-col gap-8 pb-16 md:pb-0">
      <div>
        <Link
          to={RUTAS.eventos}
          className="inline-flex items-center gap-2 border-2 border-slate-900 bg-white px-4 py-2 font-titulo text-xs font-bold uppercase shadow-brutal-sm hover:bg-amber-300"
        >
          <IconoFlechaIzquierda className="size-4" />
          <span>Volver a la cartelera</span>
        </Link>
      </div>

      {/* HERO CINEMATOGRÁFICO DEL EVENTO */}
      <section className="marco-brutal overflow-hidden bg-slate-900 text-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-slate-900 bg-amber-300 px-6 py-3 text-slate-900">
          <div className="flex flex-wrap items-center gap-2">
            <CodigoTexto codigo={evento.eventCode} />
            <BadgeCategoria categoria={evento.category} />
            <BadgeEstadoEvento estado={evento.status} />
          </div>
          {evento.minimumAge !== null && (
            <span className="border-2 border-slate-900 bg-white px-3 py-0.5 font-mono text-xs font-extrabold uppercase">
              Edad mínima: {evento.minimumAge} años
            </span>
          )}
        </div>

        <div className="bg-linear-to-r from-slate-900 via-marca-700 to-slate-900 p-6 sm:p-10">
          <h1 className="font-titulo text-3xl font-extrabold uppercase leading-tight sm:text-5xl">
            {evento.name}
          </h1>

          <div className="mt-5 flex flex-wrap items-center gap-6 font-mono text-sm">
            <span className="inline-flex items-center gap-2 border-2 border-white/30 bg-white/10 px-3 py-1.5">
              <IconoCalendario className="size-4 text-amber-300" />
              <span>{formatearFechaEvento(evento.eventDate)}</span>
            </span>

            <Link
              to={RUTAS.sede(evento.venueCode)}
              className="inline-flex items-center gap-2 border-2 border-slate-900 bg-white px-3 py-1.5 font-bold text-slate-900 shadow-brutal-sm hover:bg-amber-300"
            >
              <IconoSede className="size-4 text-acento-500" />
              <span>{evento.venueName}</span>
            </Link>
          </div>
        </div>
      </section>

      {/* CONTENIDO PRINCIPAL + PANEL DE COMPRA */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="flex flex-col gap-8 lg:col-span-7">
          {/* Descripción */}
          <Tarjeta className="flex flex-col gap-3">
            <h2 className="font-titulo text-xl font-extrabold uppercase">Sobre el evento</h2>
            <p className="text-slate-700 leading-relaxed">
              {evento.description && evento.description.trim().length > 0
                ? evento.description
                : 'Presentación oficial en vivo dentro del circuito PulsePass.'}
            </p>
          </Tarjeta>

          {/* Lineup de artistas */}
          <Tarjeta className="flex flex-col gap-4">
            <div className="flex items-center justify-between border-b-2 border-slate-900 pb-3">
              <h2 className="font-titulo text-xl font-extrabold uppercase">Artistas</h2>
              <span className="font-mono text-xs font-bold uppercase text-slate-500">
                {evento.artists.length} en cartel
              </span>
            </div>

            {evento.artists.length === 0 ? (
              <p className="text-sm text-slate-600">
                Lineup por anunciar próximamente.
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {evento.artists.map((artista) => (
                  <Link
                    key={artista.id}
                    to={RUTAS.artista(artista.id)}
                    className="flex items-center gap-3 border-2 border-slate-900 bg-slate-50 p-3 shadow-brutal-sm transition-colors hover:bg-amber-300"
                  >
                    <span className="grid size-10 shrink-0 place-items-center border-2 border-slate-900 bg-marca-600 font-titulo text-sm font-extrabold uppercase text-white">
                      {obtenerInicialesArtista(artista.stageName)}
                    </span>
                    <span className="font-titulo text-base font-extrabold uppercase">
                      {artista.stageName}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </Tarjeta>

          {/* Sede oficial */}
          <Tarjeta className="flex flex-col gap-3">
            <div className="flex items-center justify-between border-b-2 border-slate-900 pb-3">
              <h2 className="font-titulo text-xl font-extrabold uppercase">Sede</h2>
              <CodigoTexto codigo={evento.venueCode} />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="font-titulo text-lg font-extrabold uppercase">{evento.venueName}</p>
                {sede !== undefined && (
                  <p className="mt-1 font-mono text-xs font-bold uppercase text-slate-600">
                    {sede.city} · Capacidad: {sede.capacity.toLocaleString('es-CO')} personas
                  </p>
                )}
              </div>

              <Link
                to={RUTAS.sede(evento.venueCode)}
                className="inline-flex min-h-10 items-center border-2 border-slate-900 bg-white px-4 py-2 font-titulo text-xs font-bold uppercase shadow-brutal-sm hover:bg-marca-50"
              >
                Ver sede
              </Link>
            </div>
          </Tarjeta>
        </div>

        {/* Panel de entradas (se oculta para STAFF/ADMIN puros según PRD 9.5) */}
        {!esStaffOAdminSinUser && (
          <aside className="lg:col-span-5">
            <Tarjeta className="sticky top-24 flex flex-col gap-5">
              <div className="flex items-center justify-between border-b-2 border-slate-900 pb-3">
                <h2 className="font-titulo text-xl font-extrabold uppercase">Entradas</h2>
                <IconoTicket className="size-6 text-marca-600" />
              </div>

              <fieldset className="flex flex-col gap-2.5" disabled={!estaPublicado}>
                <legend className="mb-2 font-mono text-xs font-bold uppercase tracking-widest text-slate-700">
                  Tipo de entrada
                </legend>
                {TicketTypeSchema.options.map((tipo) => (
                  <label
                    key={tipo}
                    className={clsx(
                      'flex cursor-pointer items-center justify-between border-2 border-slate-900 px-4 py-3 font-titulo text-sm font-bold uppercase transition-colors',
                      tipoSeleccionado === tipo
                        ? 'bg-amber-300 shadow-brutal-sm'
                        : 'bg-white hover:bg-slate-50',
                    )}
                  >
                    <span className="flex items-center gap-2.5">
                      <input
                        type="radio"
                        name="tipoTicket"
                        value={tipo}
                        checked={tipoSeleccionado === tipo}
                        onChange={() => setTipoSeleccionado(tipo)}
                        className="size-4 accent-marca-600"
                      />
                      <span>{ETIQUETA_TIPO_TICKET[tipo]}</span>
                    </span>
                    <span className="font-mono text-xs font-bold text-slate-700">{tipo}</span>
                  </label>
                ))}
              </fieldset>

              {!estaPublicado ? (
                <div className="flex flex-col gap-2">
                  <Boton disabled anchoCompleto>
                    Comprar entrada
                  </Boton>
                  <p className="text-center font-mono text-xs font-bold uppercase text-red-700">
                    Evento no disponible para compra ({evento.status})
                  </p>
                </div>
              ) : sesion.estado !== 'autenticado' ? (
                <Boton
                  anchoCompleto
                  onClick={() =>
                    void navigate(RUTAS.login, {
                      state: { desde: RUTAS.evento(evento.eventCode) },
                    })
                  }
                >
                  Inicia sesión para comprar
                </Boton>
              ) : (
                <Link
                  to={`${RUTAS.evento(evento.eventCode)}?comprar=${tipoSeleccionado}`}
                  className="inline-flex min-h-11 w-full items-center justify-center border-2 border-slate-900 bg-marca-600 px-5 py-2.5 font-titulo text-sm font-bold uppercase text-white shadow-brutal-sm hover:bg-marca-700"
                >
                  Comprar ticket
                </Link>
              )}

              <p className="font-mono text-xs text-slate-600">
                El precio oficial lo asigna el servidor al confirmar tu orden.
              </p>
            </Tarjeta>
          </aside>
        )}
      </div>

      {sesion.estado === 'autenticado' && tieneRol('USER') && (
        <ModalCompraTicket
          abierto={comprarParam !== null}
          eventCode={evento.eventCode}
          eventName={evento.name}
          userEmail={sesion.usuario.email}
          tipoInicial={tipoInicialModal}
          onCerrar={cerrarModalCompra}
        />
      )}
    </div>
  )
}

export default PaginaDetalleEvento
