import { clsx } from 'clsx'

export type VarianteCargando = 'tarjetas' | 'lista' | 'detalle'

export interface CargandoProps {
  etiqueta?: string
  variante?: VarianteCargando
  cantidad?: number
  className?: string
}

const BLOQUE = 'animate-pulse bg-slate-200'

function EsqueletoTarjeta() {
  return (
    <div className="marco-brutal bg-white">
      <div className={clsx(BLOQUE, 'h-32 border-b-2 border-slate-900')} />
      <div className="flex flex-col gap-3 p-5">
        <div className={clsx(BLOQUE, 'h-4 w-1/3')} />
        <div className={clsx(BLOQUE, 'h-6 w-4/5')} />
        <div className={clsx(BLOQUE, 'h-4 w-1/2')} />
      </div>
    </div>
  )
}

function EsqueletoFila() {
  return (
    <div className="marco-brutal-sm flex items-center gap-4 bg-white p-4">
      <div className={clsx(BLOQUE, 'size-10 shrink-0')} />
      <div className="flex flex-1 flex-col gap-2">
        <div className={clsx(BLOQUE, 'h-4 w-2/3')} />
        <div className={clsx(BLOQUE, 'h-3 w-1/3')} />
      </div>
    </div>
  )
}

function EsqueletoDetalle() {
  return (
    <div className="flex flex-col gap-5">
      <div className={clsx(BLOQUE, 'marco-brutal h-56')} />
      <div className={clsx(BLOQUE, 'h-8 w-2/3')} />
      <div className={clsx(BLOQUE, 'h-4 w-full')} />
      <div className={clsx(BLOQUE, 'h-4 w-5/6')} />
    </div>
  )
}

const REJILLA: Record<VarianteCargando, string> = {
  tarjetas: 'grid gap-6 sm:grid-cols-2 lg:grid-cols-3',
  lista: 'flex flex-col gap-4',
  detalle: 'block',
}

/** Estado de carga con esqueletos (aria-busy="true"). */
export function Cargando({
  etiqueta = 'Cargando...',
  variante = 'lista',
  cantidad = 3,
  className,
}: CargandoProps) {
  const indices = Array.from({ length: variante === 'detalle' ? 1 : cantidad }, (_, i) => i)
  return (
    <div role="status" aria-busy="true" aria-live="polite" className={clsx(REJILLA[variante], className)}>
      <span className="sr-only">{etiqueta}</span>
      {indices.map((i) =>
        variante === 'tarjetas' ? (
          <EsqueletoTarjeta key={i} />
        ) : variante === 'detalle' ? (
          <EsqueletoDetalle key={i} />
        ) : (
          <EsqueletoFila key={i} />
        ),
      )}
    </div>
  )
}
