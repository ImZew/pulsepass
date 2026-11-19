import { clsx } from 'clsx'
import type { ReactNode } from 'react'
import { IconoAlerta, IconoCerrar, IconoExito, IconoInfo, type IconoProps } from './Iconos'

export type TonoAviso = 'exito' | 'error' | 'info' | 'advertencia'

export interface AvisoProps {
  tono?: TonoAviso
  titulo?: string
  children: ReactNode
  onCerrar?: () => void
  className?: string
}

const COLORES: Record<TonoAviso, string> = {
  exito: 'bg-emerald-100 text-emerald-900',
  error: 'bg-red-100 text-red-900',
  info: 'bg-marca-50 text-marca-700',
  advertencia: 'bg-amber-100 text-amber-900',
}

const FRANJA: Record<TonoAviso, string> = {
  exito: 'bg-emerald-500',
  error: 'bg-red-600',
  info: 'bg-marca-600',
  advertencia: 'bg-amber-400',
}

const ICONOS: Record<TonoAviso, (props: IconoProps) => ReactNode> = {
  exito: IconoExito,
  error: IconoAlerta,
  info: IconoInfo,
  advertencia: IconoAlerta,
}

/** error/advertencia → role="alert"; exito/info → role="status" + aria-live="polite". */
export function Aviso({ tono = 'info', titulo, children, onCerrar, className }: AvisoProps) {
  const esUrgente = tono === 'error' || tono === 'advertencia'
  const Icono = ICONOS[tono]

  return (
    <div
      role={esUrgente ? 'alert' : 'status'}
      aria-live={esUrgente ? undefined : 'polite'}
      className={clsx(
        'relative flex items-start gap-3 overflow-hidden border-2 border-slate-900 py-3 pr-3 pl-5 shadow-brutal-sm',
        COLORES[tono],
        className,
      )}
    >
      <span aria-hidden="true" className={clsx('absolute inset-y-0 left-0 w-2', FRANJA[tono])} />
      <Icono className="mt-0.5 size-5 shrink-0" />
      <div className="min-w-0 flex-1 text-sm">
        {titulo !== undefined && <p className="font-titulo font-bold uppercase tracking-wide">{titulo}</p>}
        <div className="break-words">{children}</div>
      </div>
      {onCerrar !== undefined && (
        <button
          type="button"
          onClick={onCerrar}
          aria-label="Cerrar aviso"
          className="grid size-7 shrink-0 place-items-center border-2 border-current hover:bg-white/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600"
        >
          <IconoCerrar className="size-3.5" />
        </button>
      )}
    </div>
  )
}
