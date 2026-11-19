import { clsx } from 'clsx'
import { useEffect, useState } from 'react'
import { IconoCopiar, IconoExito } from './Iconos'

export interface CodigoTextoProps {
  codigo: string
  copiable?: boolean
  className?: string
}

const DURACION_COPIADO_MS = 2000

/** Códigos (CMF-2026, TKT-8F2A1C) en monoespaciada con botón "Copiar" opcional (DES-05). */
export function CodigoTexto({ codigo, copiable = false, className }: CodigoTextoProps) {
  const [copiado, setCopiado] = useState(false)

  useEffect(() => {
    if (!copiado) return
    const id = window.setTimeout(() => setCopiado(false), DURACION_COPIADO_MS)
    return () => window.clearTimeout(id)
  }, [copiado])

  async function copiar() {
    try {
      await navigator.clipboard.writeText(codigo)
      setCopiado(true)
    } catch {
      setCopiado(false)
    }
  }

  return (
    <span className={clsx('inline-flex items-center gap-2', className)}>
      <code className="border-2 border-slate-900 bg-slate-900 px-2 py-0.5 font-mono text-sm font-bold tracking-wider text-white">
        {codigo}
      </code>
      {copiable && (
        <>
          <button
            type="button"
            onClick={() => void copiar()}
            className="inline-flex min-h-9 items-center gap-1.5 border-2 border-slate-900 bg-white px-2.5 font-mono text-xs font-bold uppercase shadow-brutal-sm active:translate-x-0.5 active:translate-y-0.5 active:shadow-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600"
          >
            {copiado ? <IconoExito className="size-3.5" /> : <IconoCopiar className="size-3.5" />}
            {copiado ? 'Copiado' : 'Copiar'}
          </button>
          <span className="sr-only" aria-live="polite">
            {copiado ? `Código ${codigo} copiado` : ''}
          </span>
        </>
      )}
    </span>
  )
}
