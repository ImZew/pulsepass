import { clsx } from 'clsx'
import type { ReactNode } from 'react'
import { IconoAlerta } from './Iconos'

/** Estilos compartidos por Campo y Selector. */
export const CLASE_CONTROL =
  'block w-full min-h-11 border-2 border-slate-900 bg-white px-3 py-2 text-slate-900 ' +
  'shadow-brutal-sm placeholder:text-slate-400 transition-shadow ' +
  'focus:outline-none focus-visible:shadow-brutal-marca focus-visible:outline-none ' +
  'disabled:cursor-not-allowed disabled:bg-slate-100'

export const CLASE_CONTROL_ERROR = 'border-red-600 shadow-[3px_3px_0px_0px_#dc2626]'

export interface EnvolturaCampoProps {
  idControl: string
  idMensaje: string
  etiqueta: string
  error?: string
  ayuda?: string
  className?: string
  children: ReactNode
}

/** Etiqueta + control + mensaje (error con ícono, o ayuda). */
export function EnvolturaCampo({
  idControl,
  idMensaje,
  etiqueta,
  error,
  ayuda,
  className,
  children,
}: EnvolturaCampoProps) {
  return (
    <div className={clsx('flex flex-col gap-1.5', className)}>
      <label
        htmlFor={idControl}
        className="font-mono text-xs font-bold uppercase tracking-widest text-slate-900"
      >
        {etiqueta}
      </label>
      {children}
      {error ? (
        <p id={idMensaje} className="flex items-center gap-1.5 text-sm font-semibold text-red-700">
          <IconoAlerta className="size-4 shrink-0" />
          {error}
        </p>
      ) : ayuda ? (
        <p id={idMensaje} className="text-sm text-slate-600">
          {ayuda}
        </p>
      ) : null}
    </div>
  )
}
