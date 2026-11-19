import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useSearchParams } from 'react-router'
import { Aviso } from '../../componentes/Aviso'
import { BadgeEstadoTicket } from '../../componentes/Badge'
import { Boton } from '../../componentes/Boton'
import { Campo } from '../../componentes/Campo'
import { Cargando } from '../../componentes/Cargando'
import { CodigoTexto } from '../../componentes/CodigoTexto'
import { EstadoError } from '../../componentes/EstadoError'
import {
  IconoBuscar,
  IconoExito,
  IconoFlechaDerecha,
  IconoTicket,
} from '../../componentes/Iconos'
import { PrecioCOP } from '../../componentes/PrecioCOP'
import { Tarjeta } from '../../componentes/Tarjeta'
import { ETIQUETA_ESTADO_TICKET, ETIQUETA_TIPO_TICKET } from '../../lib/etiquetas'
import { formatearFechaEvento } from '../../lib/formato'
import { esApiError, MENSAJE_ERROR_GENERICO } from '../../lib/http'
import { RUTAS } from '../../lib/rutas'
import { useMarcarTicketComoUsado, useTicket } from './hooks'
import {
  ValidacionTicketSchema,
  type TicketStatus,
  type ValidacionTicketForm,
} from './tipos'

export function PaginaValidacionIngreso() {
  const [searchParams, setSearchParams] = useSearchParams()
  const ticketDesdeUrl = (searchParams.get('ticketCode') ?? '').trim()

  const [codigoConsultado, setCodigoConsultado] = useState<string>(ticketDesdeUrl)
  const [codigoMarcadoUsado, setCodigoMarcadoUsado] = useState<string | null>(null)
  const [avisoExito, setAvisoExito] = useState<string | null>(null)
  const [errorAccion, setErrorAccion] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ValidacionTicketForm>({
    resolver: zodResolver(ValidacionTicketSchema),
    defaultValues: {
      ticketCode: ticketDesdeUrl,
    },
  })

  const consultaTicket = useTicket(codigoConsultado, codigoConsultado.length > 0)
  const marcarUsadoMutation = useMarcarTicketComoUsado()

  function alBuscarTicket(datos: ValidacionTicketForm) {
    const limpio = datos.ticketCode.trim()
    setAvisoExito(null)
    setErrorAccion(null)
    setCodigoMarcadoUsado(null)

    const nuevosParams = new URLSearchParams(searchParams)
    nuevosParams.set('ticketCode', limpio)
    setSearchParams(nuevosParams, { replace: true })

    if (limpio === codigoConsultado) {
      void consultaTicket.refetch()
      return
    }
    setCodigoConsultado(limpio)
  }

  async function manejarMarcarComoUsado(ticketCode: string) {
    setAvisoExito(null)
    setErrorAccion(null)
    try {
      await marcarUsadoMutation.mutateAsync(ticketCode)
      setCodigoMarcadoUsado(ticketCode)
      setAvisoExito(`El ticket ${ticketCode} fue marcado como usado (USED) exitosamente.`)
      await consultaTicket.refetch()
    } catch (error) {
      if (esApiError(error)) {
        setErrorAccion(error.message)
        return
      }
      setErrorAccion(MENSAJE_ERROR_GENERICO)
    }
  }

  const ticket = consultaTicket.data
  const estadoEfectivo: TicketStatus | undefined =
    ticket !== undefined
      ? codigoMarcadoUsado === ticket.ticketCode
        ? 'USED'
        : ticket.status
      : undefined

  return (
    <div className="flex flex-col gap-8">
      <header className="marco-brutal bg-slate-900 p-6 text-white sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-white/20 pb-4">
          <div>
            <p className="font-mono text-xs font-bold uppercase tracking-widest text-amber-300">
              Consola Operativa · Control de Acceso
            </p>
            <h1 className="mt-1 font-titulo text-3xl font-extrabold uppercase sm:text-4xl">
              Validación de ingreso
            </h1>
          </div>

          <Link
            to={RUTAS.staffTicketsEvento(ticket?.eventCode ?? 'CMF-2026')}
            className="inline-flex min-h-11 items-center gap-2 border-2 border-slate-900 bg-amber-300 px-4 py-2 font-titulo text-xs font-bold uppercase text-slate-900 shadow-brutal-sm hover:bg-amber-200"
          >
            <span>Tickets pagados por evento</span>
            <IconoFlechaDerecha className="size-4" />
          </Link>
        </div>

        <p className="mt-4 max-w-2xl font-mono text-xs text-slate-300">
          Ingresa o escanea el código único del ticket para consultar su ficha oficial en el
          servidor y registrar el check-in en puerta.
        </p>
      </header>

      <Tarjeta className="flex flex-col gap-4">
        <h2 className="border-b-2 border-slate-900 pb-3 font-titulo text-lg font-extrabold uppercase">
          Buscador de ticket
        </h2>

        <form
          onSubmit={(e) => void handleSubmit(alBuscarTicket)(e)}
          noValidate
          className="flex flex-col gap-4 sm:flex-row sm:items-start"
        >
          <Campo
            etiqueta="Código del ticket"
            placeholder="Ej. TKT-CMF-001"
            error={errors.ticketCode?.message}
            claseContenedor="flex-1"
            {...register('ticketCode')}
          />

          <div className="sm:mt-6">
            <Boton
              type="submit"
              cargando={consultaTicket.isFetching && !marcarUsadoMutation.isPending}
              anchoCompleto
            >
              <IconoBuscar className="size-4" />
              <span>Buscar ticket</span>
            </Boton>
          </div>
        </form>
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

      {codigoConsultado.length > 0 && consultaTicket.isLoading && (
        <Cargando variante="detalle" etiqueta="Consultando ticket en el servidor..." />
      )}

      {codigoConsultado.length > 0 && consultaTicket.isError && (
        esApiError(consultaTicket.error) && consultaTicket.error.status === 404 ? (
          <Aviso tono="error" titulo="Ticket no encontrado">
            No existe ningún ticket registrado con el código{' '}
            <strong className="font-mono">{codigoConsultado}</strong>. ({consultaTicket.error.message})
          </Aviso>
        ) : (
          <EstadoError
            mensaje={
              esApiError(consultaTicket.error) ? consultaTicket.error.message : undefined
            }
            onReintentar={() => void consultaTicket.refetch()}
          />
        )
      )}

      {ticket !== undefined && estadoEfectivo !== undefined && !consultaTicket.isError && (
        <Tarjeta className="flex flex-col gap-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-slate-900 pb-4">
            <div className="flex items-center gap-3">
              <div className="grid size-12 place-items-center border-2 border-slate-900 bg-amber-300 shadow-brutal-sm">
                <IconoTicket className="size-6" />
              </div>
              <div>
                <p className="font-mono text-xs font-bold uppercase tracking-widest text-slate-500">
                  Ficha Operativa de Control
                </p>
                <h2 className="font-titulo text-xl font-extrabold uppercase">
                  {ticket.eventName}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <BadgeEstadoTicket estado={estadoEfectivo} />
              <span className="font-mono text-xs font-bold uppercase text-slate-700">
                {ETIQUETA_ESTADO_TICKET[estadoEfectivo]}
              </span>
            </div>
          </div>

          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="border-2 border-slate-900 bg-slate-50 p-3">
              <dt className="font-mono text-xs font-bold uppercase text-slate-500">
                Código del ticket
              </dt>
              <dd className="mt-1">
                <CodigoTexto codigo={ticket.ticketCode} copiable />
              </dd>
            </div>

            <div className="border-2 border-slate-900 bg-slate-50 p-3">
              <dt className="font-mono text-xs font-bold uppercase text-slate-500">
                Evento
              </dt>
              <dd className="mt-1 flex flex-wrap items-center gap-2">
                <span className="font-titulo text-sm font-extrabold uppercase">
                  {ticket.eventName}
                </span>
                <CodigoTexto codigo={ticket.eventCode} />
              </dd>
            </div>

            <div className="border-2 border-slate-900 bg-slate-50 p-3">
              <dt className="font-mono text-xs font-bold uppercase text-slate-500">
                Titular
              </dt>
              <dd className="mt-1 font-mono text-xs font-bold break-all">
                {ticket.userEmail}
              </dd>
            </div>

            <div className="border-2 border-slate-900 bg-slate-50 p-3">
              <dt className="font-mono text-xs font-bold uppercase text-slate-500">
                Tipo de entrada
              </dt>
              <dd className="mt-1 font-titulo text-sm font-extrabold uppercase">
                {ETIQUETA_TIPO_TICKET[ticket.type]} ({ticket.type})
              </dd>
            </div>

            <div className="border-2 border-slate-900 bg-slate-50 p-3">
              <dt className="font-mono text-xs font-bold uppercase text-slate-500">
                Precio oficial
              </dt>
              <dd className="mt-1">
                <PrecioCOP valor={ticket.price} className="text-lg font-extrabold" />
              </dd>
            </div>

            <div className="border-2 border-slate-900 bg-slate-50 p-3">
              <dt className="font-mono text-xs font-bold uppercase text-slate-500">
                Fecha de compra
              </dt>
              <dd className="mt-1 font-mono text-xs font-bold">
                {formatearFechaEvento(ticket.purchaseDate)}
              </dd>
            </div>
          </dl>

          <div className="flex flex-wrap items-center justify-between gap-4 border-t-2 border-slate-900 pt-4">
            <Link
              to={RUTAS.staffTicketsEvento(ticket.eventCode)}
              className="inline-flex min-h-11 items-center gap-2 border-2 border-slate-900 bg-white px-4 py-2 font-titulo text-xs font-bold uppercase shadow-brutal-sm hover:bg-amber-300"
            >
              <span>Ver tickets pagados de {ticket.eventCode}</span>
              <IconoFlechaDerecha className="size-4" />
            </Link>

            <Boton
              variante="primario"
              cargando={marcarUsadoMutation.isPending}
              onClick={() => void manejarMarcarComoUsado(ticket.ticketCode)}
            >
              <IconoExito className="size-4" />
              <span>Marcar como usado</span>
            </Boton>
          </div>
        </Tarjeta>
      )}
    </div>
  )
}

export default PaginaValidacionIngreso
