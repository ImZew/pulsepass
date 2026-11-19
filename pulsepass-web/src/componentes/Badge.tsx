import { clsx } from 'clsx'
import type { ReactNode } from 'react'
import { ETIQUETA_CATEGORIA, ETIQUETA_ROL } from '../lib/etiquetas'
import type { EventCategory, EventStatus, Rol, TicketStatus } from '../lib/tipos'
import {
  COLORES_CATEGORIA,
  COLORES_ESTADO_EVENTO,
  COLORES_ESTADO_TICKET,
  COLORES_ROL,
} from './coloresBadge'
import { IconoCategoria } from './Iconos'

const BASE =
  'inline-flex items-center gap-1.5 border-2 border-slate-900 px-2 py-0.5 ' +
  'font-mono text-[11px] font-bold uppercase leading-5 tracking-widest whitespace-nowrap'

export interface BadgeProps {
  className?: string
  children: ReactNode
  /** Clases completas de fondo/texto (siempre desde un mapa estático). */
  colores?: string
}

export function Badge({ className, colores = 'bg-white text-slate-900', children }: BadgeProps) {
  return <span className={clsx(BASE, colores, className)}>{children}</span>
}

export interface BadgeEstadoEventoProps {
  estado: EventStatus
  className?: string
}

/** Muestra el valor del contrato (PUBLISHED, SOLD_OUT…) con estética industrial. */
export function BadgeEstadoEvento({ estado, className }: BadgeEstadoEventoProps) {
  return (
    <Badge colores={COLORES_ESTADO_EVENTO[estado]} className={className}>
      {estado}
    </Badge>
  )
}

export interface BadgeEstadoTicketProps {
  estado: TicketStatus
  className?: string
}

export function BadgeEstadoTicket({ estado, className }: BadgeEstadoTicketProps) {
  return (
    <Badge colores={COLORES_ESTADO_TICKET[estado]} className={className}>
      {estado}
    </Badge>
  )
}

export interface BadgeCategoriaProps {
  categoria: EventCategory
  className?: string
}

export function BadgeCategoria({ categoria, className }: BadgeCategoriaProps) {
  return (
    <Badge colores={COLORES_CATEGORIA[categoria]} className={className}>
      <IconoCategoria categoria={categoria} className="size-3.5" />
      {ETIQUETA_CATEGORIA[categoria]}
    </Badge>
  )
}

export interface BadgeRolProps {
  rol: Rol
  className?: string
}

export function BadgeRol({ rol, className }: BadgeRolProps) {
  return (
    <Badge colores={COLORES_ROL[rol]} className={className}>
      {ETIQUETA_ROL[rol]}
    </Badge>
  )
}
