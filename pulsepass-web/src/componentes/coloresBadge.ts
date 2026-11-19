import type { EventCategory, EventStatus, Rol, TicketStatus } from '../lib/tipos'

export const COLORES_ESTADO_EVENTO: Record<EventStatus, string> = {
  DRAFT: 'bg-slate-200 text-slate-700',
  PUBLISHED: 'bg-emerald-100 text-emerald-800',
  SOLD_OUT: 'bg-amber-100 text-amber-800',
  CANCELLED: 'bg-red-100 text-red-800',
  FINISHED: 'bg-slate-300 text-slate-800',
}

export const COLORES_ESTADO_TICKET: Record<TicketStatus, string> = {
  RESERVED: 'bg-sky-100 text-sky-800',
  PAID: 'bg-emerald-100 text-emerald-800',
  USED: 'bg-slate-300 text-slate-800',
  CANCELLED: 'bg-red-100 text-red-800',
}

export const COLORES_CATEGORIA: Record<EventCategory, string> = {
  MUSIC: 'bg-marca-50 text-marca-700',
  SPORTS: 'bg-lime-100 text-lime-800',
  TECHNOLOGY: 'bg-cyan-100 text-cyan-800',
  EDUCATION: 'bg-amber-100 text-amber-800',
  CULTURE: 'bg-fuchsia-100 text-fuchsia-800',
  ENTERTAINMENT: 'bg-rose-100 text-rose-800',
}

export const COLORES_ROL: Record<Rol, string> = {
  USER: 'bg-white text-slate-900',
  STAFF: 'bg-amber-300 text-slate-900',
  ADMIN: 'bg-slate-900 text-white',
}
