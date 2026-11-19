import type { EventCategory, EventStatus, Rol, TicketStatus, TicketType } from './tipos'

/** Etiquetas visibles en español (los valores del enum viajan intactos a la API). */
export const ETIQUETA_CATEGORIA: Record<EventCategory, string> = {
  MUSIC: 'Música',
  SPORTS: 'Deportes',
  TECHNOLOGY: 'Tecnología',
  EDUCATION: 'Educación',
  CULTURE: 'Cultura',
  ENTERTAINMENT: 'Entretenimiento',
}

export const ETIQUETA_ESTADO_EVENTO: Record<EventStatus, string> = {
  DRAFT: 'Borrador',
  PUBLISHED: 'Publicado',
  SOLD_OUT: 'Agotado',
  CANCELLED: 'Cancelado',
  FINISHED: 'Finalizado',
}

export const ETIQUETA_ESTADO_TICKET: Record<TicketStatus, string> = {
  RESERVED: 'Reservado',
  PAID: 'Pagado',
  CANCELLED: 'Cancelado',
  USED: 'Usado',
}

export const ETIQUETA_TIPO_TICKET: Record<TicketType, string> = {
  GENERAL: 'General',
  VIP: 'VIP',
  BACKSTAGE: 'Backstage',
  STUDENT: 'Estudiante',
}

export const ETIQUETA_ROL: Record<Rol, string> = {
  USER: 'Usuario',
  STAFF: 'Staff',
  ADMIN: 'Admin',
}
