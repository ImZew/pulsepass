import { clsx } from 'clsx'
import { useRef, type PointerEvent, type ReactNode } from 'react'
import { Link } from 'react-router'
import { Badge, BadgeEstadoTicket } from '../../componentes/Badge'
import { CodigoTexto } from '../../componentes/CodigoTexto'
import { IconoCalendario, IconoTicket } from '../../componentes/Iconos'
import { PrecioCOP } from '../../componentes/PrecioCOP'
import { ETIQUETA_ESTADO_TICKET, ETIQUETA_TIPO_TICKET } from '../../lib/etiquetas'
import { formatearFechaEvento } from '../../lib/formato'
import { RUTAS } from '../../lib/rutas'
import type { TicketStatus, TicketType } from '../../lib/tipos'
import type { TicketResponse } from './tipos'

export interface Boleto3DProps {
  ticket: TicketResponse
  copiable?: boolean
  acciones?: ReactNode
  className?: string
}

const COLORES_TIPO_TICKET: Record<TicketType, string> = {
  GENERAL: 'bg-white text-slate-900',
  VIP: 'bg-amber-300 text-slate-900',
  BACKSTAGE: 'bg-slate-900 text-amber-300',
  STUDENT: 'bg-cyan-100 text-cyan-900',
}

const FRANJA_ESTADO_TICKET: Record<TicketStatus, string> = {
  PAID: 'bg-emerald-400',
  RESERVED: 'bg-sky-400',
  USED: 'bg-slate-400',
  CANCELLED: 'bg-red-500',
}

const INCLINACION_MAX_GRADOS = 4

function prefiereMovimientoReducido(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function Boleto3D({
  ticket,
  copiable = true,
  acciones,
  className,
}: Boleto3DProps) {
  const refBoleto = useRef<HTMLElement>(null)

  function manejarMovimiento(evento: PointerEvent<HTMLElement>) {
    const el = refBoleto.current
    if (el === null || prefiereMovimientoReducido()) return
    const rect = el.getBoundingClientRect()
    if (rect.width === 0 || rect.height === 0) return
    const x = (evento.clientX - rect.left) / rect.width - 0.5
    const y = (evento.clientY - rect.top) / rect.height - 0.5
    el.style.setProperty('--inclinar-x', `${(-y * INCLINACION_MAX_GRADOS).toFixed(2)}deg`)
    el.style.setProperty('--inclinar-y', `${(x * INCLINACION_MAX_GRADOS).toFixed(2)}deg`)
  }

  function manejarSalida() {
    const el = refBoleto.current
    if (el === null) return
    el.style.removeProperty('--inclinar-x')
    el.style.removeProperty('--inclinar-y')
  }

  return (
    <div className={clsx('escena-3d', className)}>
      <article
        ref={refBoleto}
        aria-label={`Boleto ${ticket.ticketCode} para ${ticket.eventName}`}
        onPointerMove={manejarMovimiento}
        onPointerLeave={manejarSalida}
        className="boleto-3d marco-brutal relative grid grid-cols-1 overflow-hidden bg-white md:grid-cols-12"
      >
        {/* Franja lateral de estado */}
        <span
          aria-hidden="true"
          className={clsx(' absolute inset-y-0 left-0 w-2.5', FRANJA_ESTADO_TICKET[ticket.status])}
        />

        {/* Cuerpo principal del boleto */}
        <div className="flex flex-col justify-between gap-5 p-6 pl-8 md:col-span-8">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-slate-900 pb-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge colores={COLORES_TIPO_TICKET[ticket.type]}>
                {ETIQUETA_TIPO_TICKET[ticket.type]} · {ticket.type}
              </Badge>
              <BadgeEstadoTicket estado={ticket.status} />
              <span className="font-mono text-xs font-bold uppercase text-slate-600">
                {ETIQUETA_ESTADO_TICKET[ticket.status]}
              </span>
            </div>

            <span className="inline-flex items-center gap-1.5 font-mono text-xs font-bold uppercase text-slate-500">
              <IconoTicket className="size-4 text-marca-600" />
              <span>#{ticket.id}</span>
            </span>
          </div>

          <div className="flex flex-col gap-2">
            <p className="font-mono text-xs font-bold uppercase tracking-widest text-marca-600">
              Evento Oficial · {ticket.eventCode}
            </p>
            <h3 className="font-titulo text-2xl font-extrabold uppercase leading-tight sm:text-3xl">
              <Link
                to={RUTAS.evento(ticket.eventCode)}
                className="underline decoration-2 underline-offset-4 hover:text-marca-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600"
              >
                {ticket.eventName}
              </Link>
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-4 border-t-2 border-slate-900 pt-4 sm:grid-cols-2">
            <div>
              <p className="font-mono text-[11px] font-bold uppercase tracking-widest text-slate-500">
                Fecha de compra
              </p>
              <p className="mt-1 inline-flex items-center gap-1.5 font-mono text-xs font-bold text-slate-900">
                <IconoCalendario className="size-4 text-marca-600" />
                <span>{formatearFechaEvento(ticket.purchaseDate)}</span>
              </p>
            </div>

            <div>
              <p className="font-mono text-[11px] font-bold uppercase tracking-widest text-slate-500">
                Titular
              </p>
              <p className="mt-1 truncate font-mono text-xs font-bold text-slate-900">
                {ticket.userEmail}
              </p>
            </div>
          </div>
        </div>

        {/* Talón troquelado brutalista */}
        <div className="patron-editorial relative flex flex-col justify-between gap-4 border-t-2 border-dashed border-slate-900 bg-amber-50 p-6 md:col-span-4 md:border-t-0 md:border-l-2">
          {/* Muescas circulares del troquel */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -top-3 left-1/2 hidden size-6 -translate-x-1/2 rounded-full border-2 border-slate-900 bg-slate-50 md:left-0 md:block"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-3 left-1/2 hidden size-6 -translate-x-1/2 rounded-full border-2 border-slate-900 bg-slate-50 md:left-0 md:block"
          />

          <div className="flex flex-col gap-2">
            <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-slate-600">
              Código de boleto
            </span>
            <CodigoTexto codigo={ticket.ticketCode} copiable={copiable} />
          </div>

          <div className="border-t-2 border-slate-900 pt-3">
            <span className="block font-mono text-[11px] font-bold uppercase tracking-widest text-slate-600">
              Valor pagado
            </span>
            <PrecioCOP valor={ticket.price} className="mt-1 block text-2xl font-extrabold text-slate-900" />
          </div>

          <div className="flex flex-col gap-2">
            <Link
              to={RUTAS.evento(ticket.eventCode)}
              className="inline-flex min-h-11 items-center justify-center border-2 border-slate-900 bg-white px-4 py-2 font-titulo text-xs font-bold uppercase text-slate-900 shadow-brutal-sm hover:bg-amber-300"
            >
              Ver evento
            </Link>
            {acciones}
          </div>
        </div>
      </article>
    </div>
  )
}
