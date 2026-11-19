import { clsx } from 'clsx'
import type { ComponentProps } from 'react'

export type VarianteBoton = 'primario' | 'secundario' | 'peligro' | 'fantasma'

export interface BotonProps extends ComponentProps<'button'> {
  variante?: VarianteBoton
  cargando?: boolean
  anchoCompleto?: boolean
}

const BASE =
  'inline-flex min-h-11 items-center justify-center gap-2 px-5 py-2.5 font-titulo text-sm font-bold uppercase tracking-wide ' +
  'border-2 border-slate-900 transition-[transform,box-shadow,background-color] duration-150 ease-out select-none ' +
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600 ' +
  'disabled:cursor-not-allowed disabled:opacity-60'

/** Sombra dura que "se hunde" al presionar (desplazamiento físico). */
const CON_SOMBRA =
  'shadow-brutal-sm hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brutal ' +
  'active:translate-x-0.5 active:translate-y-0.5 active:shadow-none ' +
  'disabled:translate-x-0 disabled:translate-y-0 disabled:shadow-brutal-sm'

const VARIANTES: Record<VarianteBoton, string> = {
  primario: clsx(CON_SOMBRA, 'bg-marca-600 text-white hover:bg-marca-700'),
  secundario: clsx(CON_SOMBRA, 'bg-white text-slate-900 hover:bg-marca-50'),
  peligro: clsx(CON_SOMBRA, 'bg-red-600 text-white hover:bg-red-700'),
  fantasma: 'border-transparent bg-transparent text-slate-900 hover:border-slate-900 hover:bg-white',
}

export function Boton({
  variante = 'primario',
  cargando = false,
  anchoCompleto = false,
  disabled,
  className,
  children,
  type = 'button',
  ...resto
}: BotonProps) {
  return (
    <button
      type={type}
      disabled={disabled === true || cargando}
      aria-busy={cargando || undefined}
      className={clsx(BASE, VARIANTES[variante], anchoCompleto && 'w-full', className)}
      {...resto}
    >
      {cargando ? (
        <>
          <span
            aria-hidden="true"
            className="size-3 animate-spin border-2 border-current border-t-transparent"
          />
          Cargando...
        </>
      ) : (
        children
      )}
    </button>
  )
}
