import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { Aviso } from '../../componentes/Aviso'
import { BadgeEstadoTicket } from '../../componentes/Badge'
import { Boton } from '../../componentes/Boton'
import { Cargando } from '../../componentes/Cargando'
import { CodigoTexto } from '../../componentes/CodigoTexto'
import { EstadoError } from '../../componentes/EstadoError'
import { EstadoVacio } from '../../componentes/EstadoVacio'
import { IconoFlechaIzquierda } from '../../componentes/Iconos'
import { Modal } from '../../componentes/Modal'
import { PrecioCOP } from '../../componentes/PrecioCOP'
import { Tarjeta } from '../../componentes/Tarjeta'
import { ETIQUETA_ESTADO_TICKET, ETIQUETA_TIPO_TICKET } from '../../lib/etiquetas'
import { formatearFechaEvento } from '../../lib/formato'
import { esApiError, MENSAJE_ERROR_GENERICO } from '../../lib/http'
import { RUTAS } from '../../lib/rutas'
import { Boleto3D } from './Boleto3D'
import { useCancelarTicket, useTicket } from './hooks'

export function PaginaDetalleTicket() {
  const { ticketCode = '' } = useParams<{ ticketCode: string }>()
  const consultaTicket = useTicket(ticketCode)
  const cancelarMutation = useCancelarTicket()

  const [modalAbierto, setModalAbierto] = useState(false)
  const [errorCancelacion, setErrorCancelacion] = useState<string | null>(null)
  const [cancelacionExitosa, setCancelacionExitosa] = useState(false)

  if (consultaTicket.isLoading) {
    return <Cargando variante="detalle" etiqueta="Cargando detalle del ticket..." />
  }

  if (consultaTicket.isError) {
    if (
      esApiError(consultaTicket.error) &&
      (consultaTicket.error.status === 403 || consultaTicket.error.status === 404)
    ) {
      const esProhibido = consultaTicket.error.status === 403
      return (
        <EstadoVacio
          mensaje={
            esProhibido
              ? 'No tienes permiso para ver este ticket'
              : 'Ticket no encontrado'
          }
          descripcion={consultaTicket.error.message}
          accion={
            <Link
              to={RUTAS.misTickets}
              className="inline-flex min-h-11 items-center border-2 border-slate-900 bg-marca-600 px-5 py-2.5 font-titulo text-sm font-bold uppercase text-white shadow-brutal-sm hover:bg-marca-700"
            >
              Volver a mis tickets
            </Link>
          }
        />
      )
    }

    return (
      <EstadoError
        mensaje={esApiError(consultaTicket.error) ? consultaTicket.error.message : undefined}
        onReintentar={() => void consultaTicket.refetch()}
      />
    )
  }

  const ticket = consultaTicket.data
  if (ticket === undefined) {
    return null
  }

  function abrirModal() {
    setErrorCancelacion(null)
    setModalAbierto(true)
  }

  function cerrarModal() {
    if (cancelarMutation.isPending) return
    setErrorCancelacion(null)
    setModalAbierto(false)
  }

  async function confirmarCancelacion() {
    if (ticket === undefined) return
    setErrorCancelacion(null)
    try {
      await cancelarMutation.mutateAsync(ticket.ticketCode)
      setModalAbierto(false)
      setCancelacionExitosa(true)
      await consultaTicket.refetch()
    } catch (error) {
      if (esApiError(error)) {
        setErrorCancelacion(error.message)
        return
      }
      setErrorCancelacion(MENSAJE_ERROR_GENERICO)
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          to={RUTAS.misTickets}
          className="inline-flex min-h-11 items-center gap-2 border-2 border-slate-900 bg-white px-4 py-2 font-titulo text-xs font-bold uppercase shadow-brutal-sm hover:bg-amber-300"
        >
          <IconoFlechaIzquierda className="size-4" />
          <span>Volver a mis tickets</span>
        </Link>

        <Boton variante="peligro" onClick={abrirModal}>
          Cancelar ticket
        </Boton>
      </div>

      <header className="marco-brutal bg-white p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-mono text-xs font-bold uppercase tracking-widest text-marca-600">
              Comprobante Oficial
            </p>
            <h1 className="mt-1 font-titulo text-2xl font-extrabold uppercase sm:text-3xl">
              Detalle de ticket
            </h1>
          </div>
          <BadgeEstadoTicket estado={ticket.status} />
        </div>
      </header>

      {cancelacionExitosa && (
        <Aviso
          tono="exito"
          titulo="Ticket cancelado"
          onCerrar={() => setCancelacionExitosa(false)}
        >
          El ticket <strong>{ticket.ticketCode}</strong> fue cancelado exitosamente.
        </Aviso>
      )}

      <Boleto3D ticket={ticket} copiable />

      <Tarjeta className="flex flex-col gap-4">
        <h2 className="border-b-2 border-slate-900 pb-3 font-titulo text-xl font-extrabold uppercase">
          Información de la orden
        </h2>

        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="border-2 border-slate-900 bg-slate-50 p-3">
            <dt className="font-mono text-xs font-bold uppercase text-slate-500">Código</dt>
            <dd className="mt-1">
              <CodigoTexto codigo={ticket.ticketCode} copiable />
            </dd>
          </div>

          <div className="border-2 border-slate-900 bg-slate-50 p-3">
            <dt className="font-mono text-xs font-bold uppercase text-slate-500">Estado</dt>
            <dd className="mt-1 flex items-center gap-2">
              <BadgeEstadoTicket estado={ticket.status} />
              <span className="font-mono text-xs font-bold uppercase">
                {ETIQUETA_ESTADO_TICKET[ticket.status]}
              </span>
            </dd>
          </div>

          <div className="border-2 border-slate-900 bg-slate-50 p-3">
            <dt className="font-mono text-xs font-bold uppercase text-slate-500">Localidad</dt>
            <dd className="mt-1 font-titulo text-sm font-extrabold uppercase">
              {ETIQUETA_TIPO_TICKET[ticket.type]} ({ticket.type})
            </dd>
          </div>

          <div className="border-2 border-slate-900 bg-slate-50 p-3">
            <dt className="font-mono text-xs font-bold uppercase text-slate-500">Precio oficial</dt>
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

          <div className="border-2 border-slate-900 bg-slate-50 p-3">
            <dt className="font-mono text-xs font-bold uppercase text-slate-500">Titular</dt>
            <dd className="mt-1 font-mono text-xs font-bold">{ticket.userEmail}</dd>
          </div>
        </dl>
      </Tarjeta>

      <Modal
        abierto={modalAbierto}
        titulo="Confirmar cancelación"
        onCerrar={cerrarModal}
        cerrable={!cancelarMutation.isPending}
        pie={
          <>
            <Boton
              variante="secundario"
              onClick={cerrarModal}
              disabled={cancelarMutation.isPending}
            >
              Volver
            </Boton>
            <Boton
              variante="peligro"
              cargando={cancelarMutation.isPending}
              onClick={() => void confirmarCancelacion()}
            >
              Confirmar cancelación
            </Boton>
          </>
        }
      >
        {errorCancelacion !== null && (
          <Aviso tono="error" titulo="No se pudo cancelar el ticket">
            {errorCancelacion}
          </Aviso>
        )}

        <p className="text-sm text-slate-700">
          ¿Estás seguro de que deseas solicitar la cancelación del boleto{' '}
          <strong className="font-mono">{ticket.ticketCode}</strong> para el evento{' '}
          <strong>{ticket.eventName}</strong>?
        </p>
      </Modal>
    </div>
  )
}

export default PaginaDetalleTicket
