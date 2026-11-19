import { clsx } from 'clsx'
import { useState } from 'react'
import { Link } from 'react-router'
import { Boton } from '../../componentes/Boton'
import { Cargando } from '../../componentes/Cargando'
import { EstadoError } from '../../componentes/EstadoError'
import { EstadoVacio } from '../../componentes/EstadoVacio'
import { Selector, type OpcionSelector } from '../../componentes/Selector'
import { ETIQUETA_ESTADO_TICKET } from '../../lib/etiquetas'
import { esApiError } from '../../lib/http'
import { RUTAS } from '../../lib/rutas'
import { TicketStatusSchema, type TicketStatus } from '../../lib/tipos'
import { useAuth } from '../auth/hooks'
import { Boleto3D } from './Boleto3D'
import { useMisTickets } from './hooks'

type FiltroEstadoTicket = 'TODOS' | TicketStatus

const FILTROS_ESTADO: readonly FiltroEstadoTicket[] = [
  'TODOS',
  'PAID',
  'USED',
  'CANCELLED',
  'RESERVED',
]

const ETIQUETA_FILTRO: Record<FiltroEstadoTicket, string> = {
  TODOS: 'Todos (TODOS)',
  PAID: `${ETIQUETA_ESTADO_TICKET.PAID} (PAID)`,
  USED: `${ETIQUETA_ESTADO_TICKET.USED} (USED)`,
  CANCELLED: `${ETIQUETA_ESTADO_TICKET.CANCELLED} (CANCELLED)`,
  RESERVED: `${ETIQUETA_ESTADO_TICKET.RESERVED} (RESERVED)`,
}

const OPCIONES_SELECTOR_ESTADO: readonly OpcionSelector[] = FILTROS_ESTADO.map((estado) => ({
  valor: estado,
  etiqueta: ETIQUETA_FILTRO[estado],
}))

function parsearFiltroEstado(valor: string): FiltroEstadoTicket {
  if (valor === 'TODOS') return 'TODOS'
  const parsed = TicketStatusSchema.safeParse(valor)
  return parsed.success ? parsed.data : 'TODOS'
}

export function PaginaMisTickets() {
  const { sesion } = useAuth()
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstadoTicket>('TODOS')

  const email = sesion.estado === 'autenticado' ? sesion.usuario.email : ''
  const consultaTickets = useMisTickets(email, sesion.estado === 'autenticado')

  const listaBase = consultaTickets.data ?? []
  const ticketsFiltrados =
    filtroEstado === 'TODOS'
      ? listaBase
      : listaBase.filter((ticket) => ticket.status === filtroEstado)

  return (
    <div className="flex flex-col gap-8">
      <header className="marco-brutal bg-white p-6 sm:p-8">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b-2 border-slate-900 pb-4">
          <div>
            <p className="font-mono text-xs font-bold uppercase tracking-widest text-marca-600">
              Billetera Coleccionable
            </p>
            <h1 className="mt-1 font-titulo text-3xl font-extrabold uppercase sm:text-4xl">
              Mis tickets
            </h1>
          </div>

          {!consultaTickets.isLoading && !consultaTickets.isError && (
            <span className="border-2 border-slate-900 bg-amber-300 px-3 py-1 font-mono text-xs font-extrabold uppercase">
              {ticketsFiltrados.length}{' '}
              {ticketsFiltrados.length === 1 ? 'boleto' : 'boletos'}
            </span>
          )}
        </div>

        <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="w-full max-w-xs">
            <Selector
              etiqueta="Estado"
              opciones={OPCIONES_SELECTOR_ESTADO}
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(parsearFiltroEstado(e.target.value))}
            />
          </div>

          <div
            role="group"
            aria-label="Filtrar por estado"
            className="flex flex-wrap gap-2"
          >
            {FILTROS_ESTADO.map((estado) => {
              const activo = filtroEstado === estado
              return (
                <button
                  key={estado}
                  type="button"
                  aria-pressed={activo}
                  onClick={() => setFiltroEstado(estado)}
                  className={clsx(
                    'inline-flex min-h-11 items-center border-2 border-slate-900 px-3.5 py-2 font-mono text-xs font-bold uppercase transition-colors',
                    activo
                      ? 'bg-slate-900 text-amber-300 shadow-brutal-sm'
                      : 'bg-white text-slate-900 hover:bg-amber-100',
                  )}
                >
                  {estado}
                </button>
              )
            })}
          </div>
        </div>
      </header>

      {consultaTickets.isLoading ? (
        <Cargando variante="lista" cantidad={3} etiqueta="Cargando tus tickets..." />
      ) : consultaTickets.isError ? (
        <EstadoError
          mensaje={esApiError(consultaTickets.error) ? consultaTickets.error.message : undefined}
          onReintentar={() => void consultaTickets.refetch()}
        />
      ) : listaBase.length === 0 ? (
        <EstadoVacio
          mensaje="Aún no tienes tickets"
          descripcion="Explora la programación oficial y adquiere tu primer boleto coleccionable."
          accion={
            <Link
              to={RUTAS.eventos}
              className="inline-flex min-h-11 items-center border-2 border-slate-900 bg-marca-600 px-5 py-2.5 font-titulo text-sm font-bold uppercase text-white shadow-brutal-sm hover:bg-marca-700"
            >
              Ver cartelera
            </Link>
          }
        />
      ) : ticketsFiltrados.length === 0 ? (
        <EstadoVacio
          mensaje="Sin tickets en este estado"
          descripcion={`No encontramos boletos con estado ${filtroEstado}.`}
          accion={
            <Boton variante="secundario" onClick={() => setFiltroEstado('TODOS')}>
              Ver todos los tickets
            </Boton>
          }
        />
      ) : (
        <div className="flex flex-col gap-6">
          {ticketsFiltrados.map((ticket) => (
            <Boleto3D
              key={ticket.ticketCode}
              ticket={ticket}
              copiable
              acciones={
                <Link
                  to={RUTAS.detalleTicket(ticket.ticketCode)}
                  className="inline-flex min-h-11 items-center justify-center border-2 border-slate-900 bg-marca-600 px-4 py-2 font-titulo text-xs font-bold uppercase text-white shadow-brutal-sm hover:bg-marca-700"
                >
                  Ver detalle
                </Link>
              }
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default PaginaMisTickets
