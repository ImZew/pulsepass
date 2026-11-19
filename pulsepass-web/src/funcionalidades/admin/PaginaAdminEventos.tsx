import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router'
import { Aviso } from '../../componentes/Aviso'
import { BadgeCategoria, BadgeEstadoEvento } from '../../componentes/Badge'
import { Boton } from '../../componentes/Boton'
import { Campo } from '../../componentes/Campo'
import { Cargando } from '../../componentes/Cargando'
import { CodigoTexto } from '../../componentes/CodigoTexto'
import { EstadoError } from '../../componentes/EstadoError'
import { EstadoVacio } from '../../componentes/EstadoVacio'
import {
  IconoBuscar,
  IconoCalendario,
  IconoFlechaDerecha,
} from '../../componentes/Iconos'
import { Selector, type OpcionSelector } from '../../componentes/Selector'
import { Tabla, type ColumnaTabla } from '../../componentes/Tabla'
import { Tarjeta } from '../../componentes/Tarjeta'
import { formatearFechaEvento } from '../../lib/formato'
import { esApiError } from '../../lib/http'
import { RUTAS } from '../../lib/rutas'
import { useEventosPublicados } from './hooks'
import {
  BuscarEventoAdminSchema,
  listarEventosCreadosEnSesion,
  type BuscarEventoAdminForm,
  type EventSummaryResponse,
} from './tipos'

export function PaginaAdminEventos() {
  const navigate = useNavigate()
  const consultaPublicados = useEventosPublicados()
  const creadosEnSesion = listarEventosCreadosEnSesion()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BuscarEventoAdminForm>({
    resolver: zodResolver(BuscarEventoAdminSchema),
    defaultValues: {
      eventCode: '',
    },
  })

  const eventosPublicados = consultaPublicados.data ?? []

  const opcionesEventos: OpcionSelector[] = eventosPublicados.map((ev) => ({
    valor: ev.eventCode,
    etiqueta: `${ev.name} (${ev.eventCode})`,
  }))

  function abrirGestionEvento(eventCode: string) {
    const limpio = eventCode.trim()
    if (limpio.length === 0) return
    void navigate(RUTAS.adminGestionEvento(limpio))
  }

  function alBuscarPorCodigo(datos: BuscarEventoAdminForm) {
    abrirGestionEvento(datos.eventCode)
  }

  const columnas: readonly ColumnaTabla<EventSummaryResponse>[] = [
    {
      encabezado: 'Código',
      celda: (fila) => <CodigoTexto codigo={fila.eventCode} copiable />,
    },
    {
      encabezado: 'Evento',
      celda: (fila) => (
        <div className="flex flex-col gap-1">
          <span className="font-titulo text-sm font-extrabold uppercase">
            {fila.name}
          </span>
          {fila.category !== undefined && (
            <div>
              <BadgeCategoria categoria={fila.category} />
            </div>
          )}
        </div>
      ),
    },
    {
      encabezado: 'Fecha',
      celda: (fila) => (
        <span className="font-mono text-xs font-bold">
          {formatearFechaEvento(fila.eventDate)}
        </span>
      ),
    },
    {
      encabezado: 'Sede',
      celda: (fila) => (
        <span className="font-mono text-xs font-bold">{fila.venueName}</span>
      ),
    },
    {
      encabezado: 'Estado',
      celda: (fila) => <BadgeEstadoEvento estado={fila.status} />,
    },
    {
      encabezado: 'Acciones',
      alinear: 'fin',
      celda: (fila) => (
        <div className="flex flex-wrap items-center justify-end gap-2">
          <Link
            to={RUTAS.adminGestionEvento(fila.eventCode)}
            className="inline-flex min-h-11 items-center gap-1.5 border-2 border-slate-900 bg-marca-600 px-3.5 py-2 font-titulo text-xs font-bold uppercase text-white shadow-brutal-sm hover:bg-marca-700"
          >
            <span>Gestionar</span>
            <IconoFlechaDerecha className="size-3.5" />
          </Link>

          <Link
            to={RUTAS.staffTicketsEvento(fila.eventCode)}
            className="inline-flex min-h-11 items-center border-2 border-slate-900 bg-white px-3.5 py-2 font-titulo text-xs font-bold uppercase text-slate-900 shadow-brutal-sm hover:bg-amber-300"
          >
            Tickets pagados
          </Link>
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-8">
      <header className="marco-brutal bg-slate-900 p-6 text-white sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-white/20 pb-4">
          <div>
            <p className="font-mono text-xs font-bold uppercase tracking-widest text-amber-300">
              Consola Administrativa · Gestión de Cartelera
            </p>
            <h1 className="mt-1 font-titulo text-3xl font-extrabold uppercase sm:text-4xl">
              Administración de eventos
            </h1>
          </div>

          <Link
            to={RUTAS.adminCrearEvento}
            className="inline-flex min-h-11 items-center gap-2 border-2 border-slate-900 bg-amber-300 px-5 py-2.5 font-titulo text-xs font-bold uppercase text-slate-900 shadow-brutal-sm hover:bg-amber-200"
          >
            <IconoCalendario className="size-4" />
            <span>Crear evento</span>
          </Link>
        </div>

        <p className="mt-4 max-w-2xl font-mono text-xs text-slate-300">
          Crea nuevos eventos en borrador (DRAFT), consulta cualquier evento por su código
          único para asociarle artistas activos y publícalo en la cartelera oficial.
        </p>
      </header>

      <Tarjeta className="flex flex-col gap-6">
        <h2 className="border-b-2 border-slate-900 pb-3 font-titulo text-lg font-extrabold uppercase">
          Buscar evento por código
        </h2>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start">
          <div className="lg:col-span-5">
            <Selector
              etiqueta="Selector rápido (eventos publicados)"
              marcador="Selecciona un evento publicado"
              opciones={opcionesEventos}
              defaultValue=""
              onChange={(e) => {
                if (e.target.value.length > 0) {
                  abrirGestionEvento(e.target.value)
                }
              }}
            />
          </div>

          <form
            onSubmit={(e) => void handleSubmit(alBuscarPorCodigo)(e)}
            noValidate
            className="flex flex-col gap-4 sm:flex-row sm:items-start lg:col-span-7"
          >
            <Campo
              etiqueta="Código del evento"
              placeholder="Ej. CMF-2026"
              error={errors.eventCode?.message}
              claseContenedor="flex-1"
              {...register('eventCode')}
            />

            <div className="sm:mt-6">
              <Boton type="submit" anchoCompleto>
                <IconoBuscar className="size-4" />
                <span>Consultar evento</span>
              </Boton>
            </div>
          </form>
        </div>
      </Tarjeta>

      {creadosEnSesion.length > 0 && (
        <Tarjeta className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-slate-900 pb-3">
            <h2 className="font-titulo text-lg font-extrabold uppercase">
              Creados en esta sesión
            </h2>
            <span className="font-mono text-xs font-bold uppercase text-slate-500">
              {creadosEnSesion.length}{' '}
              {creadosEnSesion.length === 1 ? 'evento reciente' : 'eventos recientes'}
            </span>
          </div>

          <ul className="flex flex-col gap-3">
            {creadosEnSesion.map((ev) => (
              <li
                key={ev.eventCode}
                className="flex flex-wrap items-center justify-between gap-4 border-2 border-slate-900 bg-slate-50 p-4 shadow-brutal-sm"
              >
                <div className="flex flex-wrap items-center gap-3">
                  <CodigoTexto codigo={ev.eventCode} />
                  <span className="font-titulo text-base font-extrabold uppercase">
                    {ev.name}
                  </span>
                  <BadgeCategoria categoria={ev.category} />
                  <BadgeEstadoEvento estado={ev.status} />
                </div>

                <Link
                  to={RUTAS.adminGestionEvento(ev.eventCode)}
                  className="inline-flex min-h-11 items-center gap-2 border-2 border-slate-900 bg-marca-600 px-4 py-2 font-titulo text-xs font-bold uppercase text-white shadow-brutal-sm hover:bg-marca-700"
                >
                  <span>Gestionar evento</span>
                  <IconoFlechaDerecha className="size-4" />
                </Link>
              </li>
            ))}
          </ul>
        </Tarjeta>
      )}

      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-titulo text-xl font-extrabold uppercase">
            Eventos publicados en cartelera
          </h2>
          {!consultaPublicados.isLoading && !consultaPublicados.isError && (
            <span className="border-2 border-slate-900 bg-amber-300 px-3 py-1 font-mono text-xs font-extrabold uppercase text-slate-900">
              {eventosPublicados.length}{' '}
              {eventosPublicados.length === 1 ? 'publicado' : 'publicados'}
            </span>
          )}
        </div>

        {consultaPublicados.isLoading ? (
          <Cargando
            variante="lista"
            cantidad={3}
            etiqueta="Cargando eventos publicados..."
          />
        ) : consultaPublicados.isError ? (
          <EstadoError
            mensaje={
              esApiError(consultaPublicados.error)
                ? consultaPublicados.error.message
                : undefined
            }
            onReintentar={() => void consultaPublicados.refetch()}
          />
        ) : eventosPublicados.length === 0 ? (
          <EstadoVacio
            mensaje="No hay eventos publicados actualmente"
            descripcion="Crea un evento nuevo o busca un borrador por su código para publicarlo."
            accion={
              <Link
                to={RUTAS.adminCrearEvento}
                className="inline-flex min-h-11 items-center border-2 border-slate-900 bg-marca-600 px-5 py-2.5 font-titulo text-sm font-bold uppercase text-white shadow-brutal-sm hover:bg-marca-700"
              >
                Crear nuevo evento
              </Link>
            }
          />
        ) : (
          <Tabla
            columnas={columnas}
            filas={eventosPublicados}
            claveFila={(fila) => fila.eventCode}
            descripcion="Eventos publicados disponibles para administración"
          />
        )}
      </section>

      <Aviso tono="info" titulo="Nota sobre consulta de borradores (GAP-01)">
        La API expone el listado público en{' '}
        <code className="font-mono font-bold">GET /api/events/published</code>. Para
        gestionar cualquier evento en estado{' '}
        <code className="font-mono font-bold">DRAFT</code>, ingresa su código único en el
        buscador superior.
      </Aviso>
    </div>
  )
}

export default PaginaAdminEventos
