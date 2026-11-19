import type { ReactNode } from 'react'
import type { EventCategory } from '../lib/tipos'

export interface IconoProps {
  className?: string
}

interface BaseProps extends IconoProps {
  children: ReactNode
}

/** Base SVG de trazo (DES-01): decorativo, oculto a lectores de pantalla. */
function SvgBase({ className, children }: BaseProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="square"
      strokeLinejoin="miter"
      aria-hidden="true"
      focusable="false"
      className={className ?? 'size-5'}
    >
      {children}
    </svg>
  )
}

// —— Categorías ————————————————————————————————————————————————
export function IconoMusica({ className }: IconoProps) {
  return (
    <SvgBase className={className}>
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </SvgBase>
  )
}

export function IconoDeportes({ className }: IconoProps) {
  return (
    <SvgBase className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 3v18M3 12h18" />
      <path d="M5.6 5.6c3.5 3.5 3.5 9.3 0 12.8M18.4 5.6c-3.5 3.5-3.5 9.3 0 12.8" />
    </SvgBase>
  )
}

export function IconoTecnologia({ className }: IconoProps) {
  return (
    <SvgBase className={className}>
      <rect x="5" y="5" width="14" height="14" />
      <rect x="9" y="9" width="6" height="6" />
      <path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3" />
    </SvgBase>
  )
}

export function IconoEducacion({ className }: IconoProps) {
  return (
    <SvgBase className={className}>
      <path d="M2 9l10-5 10 5-10 5z" />
      <path d="M6 11v5c3 2.5 9 2.5 12 0v-5" />
      <path d="M22 9v6" />
    </SvgBase>
  )
}

export function IconoCultura({ className }: IconoProps) {
  return (
    <SvgBase className={className}>
      <path d="M3 21h18M4 10h16M12 3l9 5H3z" />
      <path d="M6 10v8M10 10v8M14 10v8M18 10v8" />
    </SvgBase>
  )
}

export function IconoEntretenimiento({ className }: IconoProps) {
  return (
    <SvgBase className={className}>
      <rect x="3" y="7" width="18" height="13" />
      <path d="M3 7l3-4M9 7l3-4M15 7l3-4" />
      <path d="M10 11l5 2.5-5 2.5z" />
    </SvgBase>
  )
}

// —— Interfaz ——————————————————————————————————————————————————
export function IconoBuscar({ className }: IconoProps) {
  return (
    <SvgBase className={className}>
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-5-5" />
    </SvgBase>
  )
}

export function IconoCalendario({ className }: IconoProps) {
  return (
    <SvgBase className={className}>
      <rect x="3" y="5" width="18" height="16" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </SvgBase>
  )
}

export function IconoSede({ className }: IconoProps) {
  return (
    <SvgBase className={className}>
      <path d="M12 22s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12z" />
      <circle cx="12" cy="10" r="2.5" />
    </SvgBase>
  )
}

export function IconoUsuario({ className }: IconoProps) {
  return (
    <SvgBase className={className}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" />
    </SvgBase>
  )
}

export function IconoTicket({ className }: IconoProps) {
  return (
    <SvgBase className={className}>
      <path d="M3 7h18v3a2 2 0 0 0 0 4v3H3v-3a2 2 0 0 0 0-4z" />
      <path d="M14 7v10" strokeDasharray="2 2" />
    </SvgBase>
  )
}

export function IconoAlerta({ className }: IconoProps) {
  return (
    <SvgBase className={className}>
      <path d="M12 3l10 18H2z" />
      <path d="M12 10v4M12 17v.5" />
    </SvgBase>
  )
}

export function IconoExito({ className }: IconoProps) {
  return (
    <SvgBase className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12l3 3 5-6" />
    </SvgBase>
  )
}

export function IconoInfo({ className }: IconoProps) {
  return (
    <SvgBase className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v6M12 7.5v.5" />
    </SvgBase>
  )
}

export function IconoCerrar({ className }: IconoProps) {
  return (
    <SvgBase className={className}>
      <path d="M6 6l12 12M18 6L6 18" />
    </SvgBase>
  )
}

export function IconoCopiar({ className }: IconoProps) {
  return (
    <SvgBase className={className}>
      <rect x="9" y="9" width="12" height="12" />
      <path d="M5 15H3V3h12v2" />
    </SvgBase>
  )
}

export function IconoMenu({ className }: IconoProps) {
  return (
    <SvgBase className={className}>
      <path d="M3 6h18M3 12h18M3 18h18" />
    </SvgBase>
  )
}

export function IconoFlechaDerecha({ className }: IconoProps) {
  return (
    <SvgBase className={className}>
      <path d="M4 12h16M14 6l6 6-6 6" />
    </SvgBase>
  )
}

export function IconoFlechaIzquierda({ className }: IconoProps) {
  return (
    <SvgBase className={className}>
      <path d="M20 12H4M10 6l-6 6 6 6" />
    </SvgBase>
  )
}

const ICONO_CATEGORIA: Record<EventCategory, (props: IconoProps) => ReactNode> = {
  MUSIC: IconoMusica,
  SPORTS: IconoDeportes,
  TECHNOLOGY: IconoTecnologia,
  EDUCATION: IconoEducacion,
  CULTURE: IconoCultura,
  ENTERTAINMENT: IconoEntretenimiento,
}

export interface IconoCategoriaProps extends IconoProps {
  categoria: EventCategory
}

export function IconoCategoria({ categoria, className }: IconoCategoriaProps) {
  const Icono = ICONO_CATEGORIA[categoria]
  return <Icono className={className} />
}
