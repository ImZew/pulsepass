import { clsx } from 'clsx'
import { useRef, type ComponentProps, type PointerEvent } from 'react'

export interface TarjetaProps extends ComponentProps<'div'> {
  /** Inclinación 3D que sigue al cursor (se desactiva con prefers-reduced-motion). */
  interactiva3D?: boolean
  /** Variante de marco: estándar o compacto. */
  compacta?: boolean
}

const INCLINACION_MAX_GRADOS = 6

function prefiereMovimientoReducido(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function Tarjeta({
  interactiva3D = false,
  compacta = false,
  className,
  children,
  onPointerMove,
  onPointerLeave,
  ...resto
}: TarjetaProps) {
  const ref = useRef<HTMLDivElement>(null)

  function manejarMovimiento(evento: PointerEvent<HTMLDivElement>) {
    onPointerMove?.(evento)
    const el = ref.current
    if (!interactiva3D || el === null || prefiereMovimientoReducido()) return
    const rect = el.getBoundingClientRect()
    if (rect.width === 0 || rect.height === 0) return
    const x = (evento.clientX - rect.left) / rect.width - 0.5
    const y = (evento.clientY - rect.top) / rect.height - 0.5
    el.style.setProperty('--inclinar-x', `${(-y * INCLINACION_MAX_GRADOS).toFixed(2)}deg`)
    el.style.setProperty('--inclinar-y', `${(x * INCLINACION_MAX_GRADOS).toFixed(2)}deg`)
  }

  function manejarSalida(evento: PointerEvent<HTMLDivElement>) {
    onPointerLeave?.(evento)
    const el = ref.current
    if (el === null) return
    el.style.removeProperty('--inclinar-x')
    el.style.removeProperty('--inclinar-y')
  }

  const tarjeta = (
    <div
      ref={ref}
      className={clsx(
        'relative bg-white',
        compacta ? 'marco-brutal-sm p-4' : 'marco-brutal p-5 sm:p-6',
        interactiva3D && 'tarjeta-3d',
        className,
      )}
      onPointerMove={manejarMovimiento}
      onPointerLeave={manejarSalida}
      {...resto}
    >
      {children}
    </div>
  )

  return interactiva3D ? <div className="escena-3d h-full">{tarjeta}</div> : tarjeta
}
