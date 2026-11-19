import { clsx } from 'clsx'
import type { ReactNode } from 'react'
import { IconoTicket } from './Iconos'

export interface EstadoVacioProps {
  mensaje: string
  descripcion?: string
  icono?: ReactNode
  /** CTA opcional (p. ej. <Link> a la cartelera). */
  accion?: ReactNode
  className?: string
}

export function EstadoVacio({ mensaje, descripcion, icono, accion, className }: EstadoVacioProps) {
  return (
    <section
      className={clsx(
        'patron-editorial flex flex-col items-center gap-4 border-2 border-dashed border-slate-900 bg-white px-6 py-12 text-center',
        className,
      )}
    >
      <div className="grid size-16 rotate-[-4deg] place-items-center border-2 border-slate-900 bg-amber-300 shadow-brutal-sm">
        {icono ?? <IconoTicket className="size-8" />}
      </div>
      <h2 className="font-titulo text-xl font-extrabold uppercase">{mensaje}</h2>
      {descripcion !== undefined && <p className="max-w-md text-slate-600">{descripcion}</p>}
      {accion}
    </section>
  )
}
