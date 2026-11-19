import { Link, useParams } from 'react-router'
import { Aviso } from '../../componentes/Aviso'
import { Cargando } from '../../componentes/Cargando'
import { EstadoError } from '../../componentes/EstadoError'
import { EstadoVacio } from '../../componentes/EstadoVacio'
import { IconoExito, IconoTicket } from '../../componentes/Iconos'
import { esApiError } from '../../lib/http'
import { RUTAS } from '../../lib/rutas'
import { Boleto3D } from './Boleto3D'
import { useTicket } from './hooks'

export function PaginaConfirmacionCompra() {
  const { ticketCode = '' } = useParams<{ ticketCode: string }>()
  const consultaTicket = useTicket(ticketCode)

  if (consultaTicket.isLoading) {
    return <Cargando variante="detalle" etiqueta="Cargando confirmación de compra..." />
  }

  if (consultaTicket.isError) {
    if (
      esApiError(consultaTicket.error) &&
      (consultaTicket.error.status === 404 || consultaTicket.error.status === 403)
    ) {
      return (
        <EstadoVacio
          mensaje={
            consultaTicket.error.status === 403
              ? 'No tienes permiso para ver este ticket'
              : 'Ticket no encontrado'
          }
          descripcion={consultaTicket.error.message}
          accion={
            <Link
              to={RUTAS.misTickets}
              className="inline-flex min-h-11 items-center border-2 border-slate-900 bg-marca-600 px-5 py-2.5 font-titulo text-sm font-bold uppercase text-white shadow-brutal-sm hover:bg-marca-700"
            >
              Ir a mis tickets
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

  return (
    <div className="flex flex-col gap-8">
      <header className="marco-brutal bg-slate-900 p-6 text-white sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="grid size-12 shrink-0 place-items-center border-2 border-slate-900 bg-emerald-400 text-slate-900 shadow-brutal-sm">
              <IconoExito className="size-7" />
            </span>
            <div>
              <p className="font-mono text-xs font-bold uppercase tracking-widest text-amber-300">
                Emisión Oficial PulsePass
              </p>
              <h1 className="font-titulo text-2xl font-extrabold uppercase sm:text-4xl">
                Confirmación de compra
              </h1>
            </div>
          </div>

          <span className="inline-flex items-center gap-2 border-2 border-white/30 bg-white/10 px-3 py-1.5 font-mono text-xs font-bold uppercase">
            <IconoTicket className="size-4 text-amber-300" />
            <span>Orden #{ticket.id}</span>
          </span>
        </div>
      </header>

      <Aviso tono="exito" titulo="¡Compra confirmada!">
        Tu boleto para <strong>{ticket.eventName}</strong> ha sido emitido con el código{' '}
        <strong>{ticket.ticketCode}</strong>. Guárdalo o consúltalo cuando quieras en tu cuenta.
      </Aviso>

      <Boleto3D ticket={ticket} copiable />

      <div className="flex flex-wrap items-center justify-between gap-4 border-2 border-slate-900 bg-white p-5 shadow-brutal-sm">
        <div className="flex flex-wrap gap-3">
          <Link
            to={RUTAS.misTickets}
            className="inline-flex min-h-11 items-center border-2 border-slate-900 bg-marca-600 px-5 py-2.5 font-titulo text-sm font-bold uppercase text-white shadow-brutal-sm hover:bg-marca-700"
          >
            Ver mis tickets
          </Link>
          <Link
            to={RUTAS.detalleTicket(ticket.ticketCode)}
            className="inline-flex min-h-11 items-center border-2 border-slate-900 bg-white px-5 py-2.5 font-titulo text-sm font-bold uppercase text-slate-900 shadow-brutal-sm hover:bg-amber-300"
          >
            Ver detalle del ticket
          </Link>
        </div>

        <Link
          to={RUTAS.eventos}
          className="inline-flex min-h-11 items-center border-2 border-slate-900 bg-white px-5 py-2.5 font-titulo text-sm font-bold uppercase text-slate-900 shadow-brutal-sm hover:bg-marca-50"
        >
          Explorar más eventos
        </Link>
      </div>
    </div>
  )
}

export default PaginaConfirmacionCompra
