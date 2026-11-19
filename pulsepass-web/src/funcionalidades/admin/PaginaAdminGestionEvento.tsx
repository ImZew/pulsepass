import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, useParams } from 'react-router'
import { Aviso } from '../../componentes/Aviso'
import { BadgeCategoria, BadgeEstadoEvento } from '../../componentes/Badge'
import { Boton } from '../../componentes/Boton'
import { Campo } from '../../componentes/Campo'
import { Cargando } from '../../componentes/Cargando'
import { CodigoTexto } from '../../componentes/CodigoTexto'
import { EstadoError } from '../../componentes/EstadoError'
import {
  IconoBuscar,
  IconoCalendario,
  IconoExito,
  IconoFlechaDerecha,
  IconoFlechaIzquierda,
  IconoSede,
} from '../../componentes/Iconos'
import { Selector, type OpcionSelector } from '../../componentes/Selector'
import { Tarjeta } from '../../componentes/Tarjeta'
import { ETIQUETA_CATEGORIA, ETIQUETA_ESTADO_EVENTO } from '../../lib/etiquetas'
import { formatearFechaEvento } from '../../lib/formato'
import { esApiError, MENSAJE_ERROR_GENERICO } from '../../lib/http'
import { RUTAS } from '../../lib/rutas'
import { obtenerInicialesArtista } from '../artistas/iniciales'
import {
  useArtistasActivos,
  useAsignarArtistaAEvento,
  useEvento,
  useEventosPublicados,
  usePublicarEvento,
} from './hooks'
import {
  actualizarEstadoEventoEnSesion,
  AsignarArtistaSchema,
  BuscarEventoAdminSchema,
  type AsignarArtistaForm,
  type BuscarEventoAdminForm,
  type EventStatus,
} from './tipos'

export function PaginaAdminGestionEvento() {
  const { eventCode = '' } = useParams<{ eventCode: string }>()
  const navigate = useNavigate()

  const codigoEventoActual = eventCode.trim()

  const consultaEvento = useEvento(codigoEventoActual)
  const consultaEventosPublicados = useEventosPublicados()
  const consultaArtistasActivos = useArtistasActivos()

  const publicarMutation = usePublicarEvento()
  const asignarArtistaMutation = useAsignarArtistaAEvento()

  const [codigoPublicadoLocal, setCodigoPublicadoLocal] = useState<string | null>(null)
  const [avisoExito, setAvisoExito] = useState<string | null>(null)
  const [errorAccion, setErrorAccion] = useState<string | null>(null)

  const {
    register: registerBusqueda,
    handleSubmit: handleSubmitBusqueda,
    setValue: setValueBusqueda,
    formState: { errors: errorsBusqueda },
  } = useForm<BuscarEventoAdminForm>({
    resolver: zodResolver(BuscarEventoAdminSchema),
    defaultValues: {
      eventCode: codigoEventoActual,
    },
  })

  const {
    register: registerArtista,
    handleSubmit: handleSubmitArtista,
    reset: resetArtista,
    formState: { errors: errorsArtista },
  } = useForm<AsignarArtistaForm>({
    resolver: zodResolver(AsignarArtistaSchema),
    defaultValues: {
      artistId: '',
    },
  })

  useEffect(() => {
    setValueBusqueda('eventCode', codigoEventoActual)
  }, [codigoEventoActual, setValueBusqueda])

  const opcionesEventos: OpcionSelector[] = (
    consultaEventosPublicados.data ?? []
  ).map((ev) => ({
    valor: ev.eventCode,
    etiqueta: `${ev.name} (${ev.eventCode})`,
  }))

  const opcionesArtistas: OpcionSelector[] = (
    consultaArtistasActivos.data ?? []
  ).map((artista) => ({
    valor: String(artista.id),
    etiqueta: artista.stageName,
  }))

  function cambiarEvento(nuevoCodigo: string) {
    const limpio = nuevoCodigo.trim()
    if (limpio.length === 0) return
    setAvisoExito(null)
    setErrorAccion(null)
    setCodigoPublicadoLocal(null)
    if (limpio === codigoEventoActual) {
      void consultaEvento.refetch()
      return
    }
    void navigate(RUTAS.adminGestionEvento(limpio))
  }

  function alBuscarEvento(datos: BuscarEventoAdminForm) {
    cambiarEvento(datos.eventCode)
  }

  async function manejarPublicarEvento() {
    if (codigoEventoActual.length === 0) return
    setAvisoExito(null)
    setErrorAccion(null)
    try {
      await publicarMutation.mutateAsync(codigoEventoActual)
      setCodigoPublicadoLocal(codigoEventoActual)
      actualizarEstadoEventoEnSesion(codigoEventoActual, 'PUBLISHED')
      setAvisoExito(
        `El evento ${codigoEventoActual} fue publicado (PUBLISHED) exitosamente.`,
      )
      await consultaEvento.refetch()
    } catch (error) {
      if (esApiError(error)) {
        setErrorAccion(error.message)
        return
      }
      setErrorAccion(MENSAJE_ERROR_GENERICO)
    }
  }

  async function manejarAsignarArtista(datos: AsignarArtistaForm) {
    if (codigoEventoActual.length === 0) return
    setAvisoExito(null)
    setErrorAccion(null)

    const artistId = Number(datos.artistId)
    const artistaSeleccionado = (consultaArtistasActivos.data ?? []).find(
      (a) => a.id === artistId,
    )

    try {
      await asignarArtistaMutation.mutateAsync({
        eventCode: codigoEventoActual,
        artistId,
      })
      const nombreArtista = artistaSeleccionado?.stageName ?? `#${artistId}`
      setAvisoExito(
        `Artista ${nombreArtista} asignado al evento ${codigoEventoActual} exitosamente.`,
      )
      resetArtista({ artistId: '' })
      await consultaEvento.refetch()
    } catch (error) {
      if (esApiError(error)) {
        setErrorAccion(error.message)
        return
      }
      setErrorAccion(MENSAJE_ERROR_GENERICO)
    }
  }

  const evento = consultaEvento.data
  const estadoEfectivo: EventStatus | undefined =
    evento !== undefined
      ? codigoPublicadoLocal === evento.eventCode
        ? 'PUBLISHED'
        : evento.status
      : undefined

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-8">
      <header className="marco-brutal bg-slate-900 p-6 text-white sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-white/20 pb-4">
          <div>
            <p className="font-mono text-xs font-bold uppercase tracking-widest text-amber-300">
              Consola Administrativa · Lineup y Publicación
            </p>
            <h1 className="mt-1 font-titulo text-3xl font-extrabold uppercase sm:text-4xl">
              Gestionar evento
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {codigoEventoActual.length > 0 && (
              <CodigoTexto codigo={codigoEventoActual} />
            )}

            <Link
              to={RUTAS.adminCrearEvento}
              className="inline-flex min-h-11 items-center gap-2 border-2 border-slate-900 bg-amber-300 px-4 py-2 font-titulo text-xs font-bold uppercase text-slate-900 shadow-brutal-sm hover:bg-amber-200"
            >
              <IconoCalendario className="size-4" />
              <span>Crear evento</span>
            </Link>

            <Link
              to={RUTAS.adminEventos}
              className="inline-flex min-h-11 items-center gap-2 border-2 border-slate-900 bg-white px-4 py-2 font-titulo text-xs font-bold uppercase text-slate-900 shadow-brutal-sm hover:bg-amber-300"
            >
              <IconoFlechaIzquierda className="size-4" />
              <span>Volver a eventos</span>
            </Link>
          </div>
        </div>

        <p className="mt-4 max-w-2xl font-mono text-xs text-slate-300">
          Consulta la ficha administrativa de cualquier evento (incluidos borradores en
          estado DRAFT), asocia artistas activos al lineup y ejecuta su publicación oficial.
        </p>
      </header>

      <Tarjeta className="flex flex-col gap-6">
        <h2 className="border-b-2 border-slate-900 pb-3 font-titulo text-lg font-extrabold uppercase">
          Selección o búsqueda de evento
        </h2>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start">
          <div className="lg:col-span-5">
            <Selector
              etiqueta="Selector rápido (eventos publicados)"
              marcador="Selecciona un evento publicado"
              opciones={opcionesEventos}
              value={
                opcionesEventos.some((op) => op.valor === codigoEventoActual)
                  ? codigoEventoActual
                  : ''
              }
              onChange={(e) => {
                if (e.target.value.length > 0) {
                  cambiarEvento(e.target.value)
                }
              }}
            />
          </div>

          <form
            onSubmit={(e) => void handleSubmitBusqueda(alBuscarEvento)(e)}
            noValidate
            className="flex flex-col gap-4 sm:flex-row sm:items-start lg:col-span-7"
          >
            <Campo
              etiqueta="Código del evento"
              placeholder="Ej. CMF-2026"
              error={errorsBusqueda.eventCode?.message}
              claseContenedor="flex-1"
              {...registerBusqueda('eventCode')}
            />

            <div className="sm:mt-6">
              <Boton
                type="submit"
                cargando={
                  consultaEvento.isFetching &&
                  !publicarMutation.isPending &&
                  !asignarArtistaMutation.isPending
                }
                anchoCompleto
              >
                <IconoBuscar className="size-4" />
                <span>Consultar evento</span>
              </Boton>
            </div>
          </form>
        </div>
      </Tarjeta>

      {avisoExito !== null && (
        <Aviso
          tono="exito"
          titulo="Operación completada"
          onCerrar={() => setAvisoExito(null)}
        >
          {avisoExito}
        </Aviso>
      )}

      {errorAccion !== null && (
        <Aviso
          tono="error"
          titulo="Operación rechazada por el servidor"
          onCerrar={() => setErrorAccion(null)}
        >
          {errorAccion}
        </Aviso>
      )}

      {consultaEvento.isLoading ? (
        <Cargando
          variante="detalle"
          etiqueta="Consultando evento en el servidor..."
        />
      ) : consultaEvento.isError ? (
        esApiError(consultaEvento.error) && consultaEvento.error.status === 404 ? (
          <Aviso tono="error" titulo="Evento no encontrado">
            No existe ningún evento registrado con el código{' '}
            <strong className="font-mono">{codigoEventoActual}</strong>. (
            {consultaEvento.error.message})
          </Aviso>
        ) : (
          <EstadoError
            mensaje={
              esApiError(consultaEvento.error)
                ? consultaEvento.error.message
                : undefined
            }
            onReintentar={() => void consultaEvento.refetch()}
          />
        )
      ) : (
        evento !== undefined &&
        estadoEfectivo !== undefined && (
          <>
            {/* FICHA PRINCIPAL DEL EVENTO */}
            <Tarjeta className="flex flex-col gap-6">
              <div className="flex flex-wrap items-start justify-between gap-4 border-b-2 border-slate-900 pb-4">
                <div className="flex flex-col gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <CodigoTexto codigo={evento.eventCode} copiable />
                    <BadgeCategoria categoria={evento.category} />
                  </div>
                  <h2 className="font-titulo text-2xl font-extrabold uppercase sm:text-3xl">
                    {evento.name}
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <BadgeEstadoEvento estado={estadoEfectivo} />
                  <span className="font-mono text-xs font-bold uppercase text-slate-700">
                    {ETIQUETA_ESTADO_EVENTO[estadoEfectivo]}
                  </span>
                </div>
              </div>

              {evento.description !== null &&
                evento.description.trim().length > 0 && (
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {evento.description}
                  </p>
                )}

              <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="border-2 border-slate-900 bg-slate-50 p-3">
                  <dt className="font-mono text-xs font-bold uppercase text-slate-500">
                    Sede asignada
                  </dt>
                  <dd className="mt-1 flex flex-col gap-1">
                    <span className="inline-flex items-center gap-1.5 font-titulo text-sm font-extrabold uppercase">
                      <IconoSede className="size-4 text-acento-500" />
                      <span>{evento.venueName}</span>
                    </span>
                    <div>
                      <CodigoTexto codigo={evento.venueCode} />
                    </div>
                  </dd>
                </div>

                <div className="border-2 border-slate-900 bg-slate-50 p-3">
                  <dt className="font-mono text-xs font-bold uppercase text-slate-500">
                    Fecha y hora
                  </dt>
                  <dd className="mt-1 inline-flex items-center gap-1.5 font-mono text-xs font-bold">
                    <IconoCalendario className="size-4 text-marca-600" />
                    <span>{formatearFechaEvento(evento.eventDate)}</span>
                  </dd>
                </div>

                <div className="border-2 border-slate-900 bg-slate-50 p-3">
                  <dt className="font-mono text-xs font-bold uppercase text-slate-500">
                    Edad mínima
                  </dt>
                  <dd className="mt-1 font-mono text-sm font-extrabold">
                    {evento.minimumAge !== null
                      ? `${evento.minimumAge} años`
                      : 'Todo público'}
                  </dd>
                </div>

                <div className="border-2 border-slate-900 bg-slate-50 p-3">
                  <dt className="font-mono text-xs font-bold uppercase text-slate-500">
                    Categoría
                  </dt>
                  <dd className="mt-1 font-titulo text-sm font-extrabold uppercase">
                    {ETIQUETA_CATEGORIA[evento.category]} ({evento.category})
                  </dd>
                </div>
              </dl>

              <div className="flex flex-wrap items-center justify-between gap-3 border-t-2 border-slate-900 pt-4">
                <Link
                  to={RUTAS.staffTicketsEvento(evento.eventCode)}
                  className="inline-flex min-h-11 items-center gap-2 border-2 border-slate-900 bg-white px-4 py-2 font-titulo text-xs font-bold uppercase text-slate-900 shadow-brutal-sm hover:bg-amber-300"
                >
                  <span>Tickets pagados de {evento.eventCode}</span>
                  <IconoFlechaDerecha className="size-4" />
                </Link>

                <Link
                  to={RUTAS.evento(evento.eventCode)}
                  className="inline-flex min-h-11 items-center gap-2 border-2 border-slate-900 bg-white px-4 py-2 font-titulo text-xs font-bold uppercase text-slate-900 shadow-brutal-sm hover:bg-marca-50"
                >
                  <span>Ver ficha pública</span>
                  <IconoFlechaDerecha className="size-4" />
                </Link>
              </div>
            </Tarjeta>

            {/* PUBLICACIÓN DEL EVENTO */}
            <Tarjeta className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="font-titulo text-lg font-extrabold uppercase">
                    Publicación
                  </h2>
                  <p className="mt-1 text-sm text-slate-600">
                    El evento es visible para el público en la cartelera una vez
                    publicado (<code className="font-mono font-bold">PUBLISHED</code>).
                  </p>
                </div>

                <Boton
                  variante="primario"
                  cargando={publicarMutation.isPending}
                  onClick={() => void manejarPublicarEvento()}
                >
                  <IconoExito className="size-4" />
                  <span>Publicar evento</span>
                </Boton>
              </div>
            </Tarjeta>

            {/* LINEUP / ARTISTAS ASOCIADOS */}
            <Tarjeta className="flex flex-col gap-6">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-slate-900 pb-3">
                <h2 className="font-titulo text-lg font-extrabold uppercase">
                  Artistas asociados (Lineup)
                </h2>
                <span className="font-mono text-xs font-bold uppercase text-slate-500">
                  {evento.artists.length} en cartel
                </span>
              </div>

              {evento.artists.length === 0 ? (
                <p className="border-2 border-dashed border-slate-900 bg-slate-50 p-4 font-mono text-xs font-bold text-slate-600">
                  Este evento aún no tiene artistas asignados.
                </p>
              ) : (
                <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {evento.artists.map((artista) => (
                    <li
                      key={artista.id}
                      className="flex items-center justify-between gap-3 border-2 border-slate-900 bg-slate-50 p-3 shadow-brutal-sm"
                    >
                      <div className="flex items-center gap-3">
                        <span className="grid size-10 shrink-0 place-items-center border-2 border-slate-900 bg-marca-600 font-titulo text-sm font-extrabold uppercase text-white">
                          {obtenerInicialesArtista(artista.stageName)}
                        </span>
                        <div>
                          <p className="font-titulo text-base font-extrabold uppercase">
                            {artista.stageName}
                          </p>
                          <p className="font-mono text-[11px] font-bold uppercase text-slate-500">
                            ID #{artista.id}
                          </p>
                        </div>
                      </div>

                      <Link
                        to={RUTAS.artista(artista.id)}
                        className="inline-flex min-h-9 items-center border-2 border-slate-900 bg-white px-2.5 py-1 font-mono text-xs font-bold uppercase hover:bg-amber-300"
                      >
                        Ver perfil
                      </Link>
                    </li>
                  ))}
                </ul>
              )}

              <form
                onSubmit={(e) => void handleSubmitArtista(manejarAsignarArtista)(e)}
                noValidate
                className="flex flex-col gap-4 border-t-2 border-slate-900 pt-5 sm:flex-row sm:items-start"
              >
                <Selector
                  etiqueta="Artista"
                  marcador="Selecciona un artista activo"
                  opciones={opcionesArtistas}
                  error={errorsArtista.artistId?.message}
                  claseContenedor="flex-1"
                  {...registerArtista('artistId')}
                />

                <div className="sm:mt-6">
                  <Boton
                    type="submit"
                    cargando={asignarArtistaMutation.isPending}
                    anchoCompleto
                  >
                    <span>Asignar artista</span>
                  </Boton>
                </div>
              </form>
            </Tarjeta>
          </>
        )
      )}
    </div>
  )
}

export default PaginaAdminGestionEvento
