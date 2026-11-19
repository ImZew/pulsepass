import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, useParams } from 'react-router'
import { Aviso } from '../../componentes/Aviso'
import { BadgeEstadoTicket } from '../../componentes/Badge'
import { Boton } from '../../componentes/Boton'
import { Campo } from '../../componentes/Campo'
import { Cargando } from '../../componentes/Cargando'
import { CodigoTexto } from '../../componentes/CodigoTexto'
import { EstadoError } from '../../componentes/EstadoError'
import { EstadoVacio } from '../../componentes/EstadoVacio'
import {
  IconoBuscar,
  IconoExito,
  IconoFlechaIzquierda,
} from '../../componentes/Iconos'
import { PrecioCOP } from '../../componentes/PrecioCOP'
import { Selector, type OpcionSelector } from '../../componentes/Selector'
import { Tabla, type ColumnaTabla } from '../../componentes/Tabla'
import { Tarjeta } from '../../componentes/Tarjeta'
import { ETIQUETA_TIPO_TICKET } from '../../lib/etiquetas'
import { esApiError, MENSAJE_ERROR_GENERICO } from '../../lib/http'
import { RUTAS } from '../../lib/rutas'
import { useEventosPublicados } from '../eventos/hooks'
import { useMarcarTicketComoUsado, useTicketsPagadosPorEvento } from './hooks'
import {
  ConsultaEventoStaffSchema,
  type ConsultaEventoStaffForm,
  type TicketResponse,
} from './tipos'

export function PaginaTicketsPagadosEvento() {
  const { eventCode = '' } = useParams<{ eventCode: string }>()
  const navigate = useNavigate()

  const codigoEventoActual = eventCode.trim()
  const consultaEventosPublicados = useEventosPublicados()
  const consultaTicketsPagados = useTicketsPagadosPorEvento(codigoEventoActual)
  const marcarUsadoMutation = useMarcarTicketComoUsado()

  const [ticketProcesando, setTicketProcesando] = useState<string | null>(null)
  const [codigosUsadosLocal, setCodigosUsadosLocal] = useState<readonly string[]>([])
  const [avisoExito, setAvisoExito] = useState<string | null>(null)
  const [errorAccion, setErrorAccion] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ConsultaEventoStaffForm>({
    resolver: zodResolver(ConsultaEventoStaffSchema),
    defaultValues: {
      eventCode: codigoEventoActual,
    },
  })

  useEffect(() => {
    setValue('eventCode', codigoEventoActual)
  }, [codigoEventoActual, setValue])

  const opcionesEventos: OpcionSelector[] = (consultaEventosPublicados.data ?? []).map(
    (ev) => ({
      valor: ev.eventCode,
      etiqueta: `${ev.name} (${ev.eventCode})`,
    }),
  )

  function cambiarEvento(nuevoCodigo: string) {
    const limpio = nuevoCodigo.trim()
    if (limpio.length === 0) return
    setAvisoExito(null)
    setErrorAccion(null)
    if (limpio === codigoEventoActual) {
      void consultaTicketsPagados.refetch()
      return
    }
    void navigate(RUTAS.staffTicketsEvento(limpio))
  }

  function alConsultarEvento(datos: ConsultaEventoStaffForm) {
    cambiarEvento(datos.eventCode)
  }

  async function manejarMarcarComoUsado(ticketCode: string) {
    setAvisoExito(null)
    setErrorAccion(null)
    setTicketProcesando(ticketCode)
    try {
      await marcarUsadoMutation.mutateAsync(ticketCode)
      setCodigosUsadosLocal((prev) =>
        prev.includes(ticketCode) ? prev : [...prev, ticketCode],
      )
      setAvisoExito(`El ticket ${ticketCode} fue marcado como usado (USED) exitosamente.`)
      await consultaTicketsPagados.refetch()
    } catch (error) {
      if (esApiError(error)) {
        setErrorAccion(error.message)
        return
      }
      setErrorAccion(MENSAJE_ERROR_GENERICO)
    } finally {
      setTicketProcesando(null)
    }
  }

  const tickets = consultaTicketsPagados.data ?? []

  const columnas: readonly ColumnaTabla<TicketResponse>[] = [
    {
      encabezado: 'Código',
      celda: (fila) => <CodigoTexto codigo={fila.ticketCode} copiable />,
    },
    {
      encabezado: 'Titular',
      celda: (fila) => (
        <span className="font-mono text-xs font-bold break-all">{fila.userEmail}</span>
      ),
    },
    {
      encabezado: 'Tipo',
      celda: (fila) => (
        <span className="font-titulo text-xs font-extrabold uppercase">
          {ETIQUETA_TIPO_TICKET[fila.type]} ({fila.type})
        </span>
      ),
    },
    {
      encabezado: 'Precio',
      celda: (fila) => <PrecioCOP valor={fila.price} />,
    },
    {
      encabezado: 'Estado',
      celda: (fila) => {
        const estadoEfectivo = codigosUsadosLocal.includes(fila.ticketCode)
          ? 'USED'
          : fila.status
        return <BadgeEstadoTicket estado={estadoEfectivo} />
      },
    },
    {
      encabezado: 'Acciones',
      alinear: 'fin',
      celda: (fila) => (
        <div className="flex flex-wrap items-center justify-end gap-2">
          <Boton
            variante="primario"
            cargando={
              marcarUsadoMutation.isPending && ticketProcesando === fila.ticketCode
            }
            onClick={() => void manejarMarcarComoUsado(fila.ticketCode)}
          >
            <IconoExito className="size-4" />
            <span>Marcar como usado</span>
          </Boton>

          <Link
            to={`${RUTAS.staffValidacion}?ticketCode=${encodeURIComponent(fila.ticketCode)}`}
            className="inline-flex min-h-11 items-center justify-center border-2 border-slate-900 bg-white px-3.5 py-2 font-titulo text-xs font-bold uppercase text-slate-900 shadow-brutal-sm hover:bg-amber-300"
          >
            Abrir en validador
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
              Consola Operativa · Aforo Confirmado
            </p>
            <h1 className="mt-1 font-titulo text-3xl font-extrabold uppercase sm:text-4xl">
              Tickets pagados
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {codigoEventoActual.length > 0 && (
              <CodigoTexto codigo={codigoEventoActual} />
            )}

            {!consultaTicketsPagados.isLoading && !consultaTicketsPagados.isError && (
              <span className="border-2 border-slate-900 bg-amber-300 px-3 py-1.5 font-mono text-xs font-extrabold uppercase text-slate-900">
                {tickets.length}{' '}
                {tickets.length === 1 ? 'entrada pagada' : 'entradas pagadas'}
              </span>
            )}

            <Link
              to={RUTAS.staffValidacion}
              className="inline-flex min-h-11 items-center gap-2 border-2 border-slate-900 bg-white px-4 py-2 font-titulo text-xs font-bold uppercase text-slate-900 shadow-brutal-sm hover:bg-amber-300"
            >
              <IconoFlechaIzquierda className="size-4" />
              <span>Ir al validador</span>
            </Link>
          </div>
        </div>

        <p className="mt-4 max-w-2xl font-mono text-xs text-slate-300">
          Consulta las entradas con estado pagado (PAID) emitidas para cualquier evento y
          ejecuta el control de ingreso directo o abre un boleto en el validador.
        </p>
      </header>

      <Tarjeta className="flex flex-col gap-6">
        <h2 className="border-b-2 border-slate-900 pb-3 font-titulo text-lg font-extrabold uppercase">
          Selección de evento
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
            onSubmit={(e) => void handleSubmit(alConsultarEvento)(e)}
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
              <Boton
                type="submit"
                cargando={
                  consultaTicketsPagados.isFetching && !marcarUsadoMutation.isPending
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
          titulo="Ingreso registrado"
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

      {consultaTicketsPagados.isLoading ? (
        <Cargando
          variante="lista"
          cantidad={3}
          etiqueta="Cargando tickets pagados del evento..."
        />
      ) : consultaTicketsPagados.isError ? (
        <EstadoError
          titulo={
            esApiError(consultaTicketsPagados.error) &&
            consultaTicketsPagados.error.status === 404
              ? 'Evento no encontrado'
              : 'Algo salió mal'
          }
          mensaje={
            esApiError(consultaTicketsPagados.error)
              ? consultaTicketsPagados.error.message
              : undefined
          }
          onReintentar={() => void consultaTicketsPagados.refetch()}
        />
      ) : tickets.length === 0 ? (
        <EstadoVacio
          mensaje="Sin tickets pagados para este evento"
          descripcion={`El evento ${codigoEventoActual} no registra entradas en estado PAID en este momento.`}
          accion={
            <Link
              to={RUTAS.staffValidacion}
              className="inline-flex min-h-11 items-center border-2 border-slate-900 bg-marca-600 px-5 py-2.5 font-titulo text-sm font-bold uppercase text-white shadow-brutal-sm hover:bg-marca-700"
            >
              Validar código individual
            </Link>
          }
        />
      ) : (
        <Tabla
          columnas={columnas}
          filas={tickets}
          claveFila={(fila) => fila.ticketCode}
          descripcion={`Tickets pagados del evento ${codigoEventoActual}`}
        />
      )}
    </div>
  )
}

export default PaginaTicketsPagadosEvento
