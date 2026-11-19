import { useEffect, useId, useRef, type KeyboardEvent, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { IconoCerrar } from './Iconos'

export interface ModalProps {
  abierto: boolean
  titulo: string
  onCerrar: () => void
  children: ReactNode
  /** Acciones al pie (botones). */
  pie?: ReactNode
  /** Si es false, Escape/fondo/botón X no cierran (p. ej. con una mutación en curso). */
  cerrable?: boolean
}

const SELECTOR_FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

function elementosFocusables(contenedor: HTMLElement): HTMLElement[] {
  return Array.from(contenedor.querySelectorAll<HTMLElement>(SELECTOR_FOCUSABLE))
}

/**
 * Diálogo accesible: role="dialog", aria-modal, foco atrapado, Escape para cerrar.
 * Los errores (p. ej. 409) se renderizan como children y el modal NO se cierra solo (DES-10).
 */
export function Modal({ abierto, titulo, onCerrar, children, pie, cerrable = true }: ModalProps) {
  const idTitulo = useId()
  const refDialogo = useRef<HTMLDivElement>(null)
  const refOnCerrar = useRef(onCerrar)

  useEffect(() => {
    refOnCerrar.current = onCerrar
  }, [onCerrar])

  useEffect(() => {
    if (!abierto) return
    const previo = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const dialogo = refDialogo.current
    if (dialogo !== null) {
      const [primero] = elementosFocusables(dialogo)
      ;(primero ?? dialogo).focus()
    }
    const overflowPrevio = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = overflowPrevio
      previo?.focus()
    }
  }, [abierto])

  if (!abierto) return null

  function manejarTeclado(evento: KeyboardEvent<HTMLDivElement>) {
    if (evento.key === 'Escape') {
      evento.stopPropagation()
      if (cerrable) refOnCerrar.current()
      return
    }
    if (evento.key !== 'Tab') return
    const dialogo = refDialogo.current
    if (dialogo === null) return
    const focusables = elementosFocusables(dialogo)
    const primero = focusables[0]
    const ultimo = focusables[focusables.length - 1]
    if (primero === undefined || ultimo === undefined) {
      evento.preventDefault()
      return
    }
    if (evento.shiftKey && document.activeElement === primero) {
      evento.preventDefault()
      ultimo.focus()
    } else if (!evento.shiftKey && document.activeElement === ultimo) {
      evento.preventDefault()
      primero.focus()
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      <div
        aria-hidden="true"
        data-testid="modal-fondo"
        className="patron-editorial absolute inset-0 bg-slate-900/60"
        onClick={() => {
          if (cerrable) onCerrar()
        }}
      />
      <div className="escena-3d relative w-full max-w-lg">
        <div
          ref={refDialogo}
          role="dialog"
          aria-modal="true"
          aria-labelledby={idTitulo}
          tabIndex={-1}
          onKeyDown={manejarTeclado}
          className="modal-entrada relative border-2 border-slate-900 bg-white shadow-brutal-lg focus:outline-none"
        >
          <header className="flex items-start justify-between gap-4 border-b-2 border-slate-900 bg-marca-50 px-5 py-4">
            <h2 id={idTitulo} className="font-titulo text-xl font-extrabold uppercase leading-tight">
              {titulo}
            </h2>
            {cerrable && (
              <button
                type="button"
                onClick={onCerrar}
                aria-label="Cerrar"
                className="grid size-9 shrink-0 place-items-center border-2 border-slate-900 bg-white hover:bg-acento-500 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600"
              >
                <IconoCerrar className="size-4" />
              </button>
            )}
          </header>
          <div className="flex flex-col gap-4 px-5 py-5">{children}</div>
          {pie !== undefined && (
            <footer className="flex flex-col-reverse gap-3 border-t-2 border-slate-900 px-5 py-4 sm:flex-row sm:justify-end">
              {pie}
            </footer>
          )}
        </div>
      </div>
    </div>,
    document.body,
  )
}
