import { clsx } from 'clsx'
import type { ReactNode } from 'react'

export interface ColumnaTabla<T> {
  encabezado: string
  celda: (fila: T) => ReactNode
  /** Alineación opcional de la columna. */
  alinear?: 'inicio' | 'fin'
}

export interface TablaProps<T> {
  columnas: readonly ColumnaTabla<T>[]
  filas: readonly T[]
  claveFila: (fila: T) => string | number
  /** Título accesible de la tabla (caption sr-only) y de la lista móvil. */
  descripcion?: string
  className?: string
}

const ALINEACION: Record<NonNullable<ColumnaTabla<unknown>['alinear']>, string> = {
  inicio: 'text-left',
  fin: 'text-right',
}

/**
 * Tabla genérica: en escritorio una <table> brutalista; en móvil cada fila es una tarjeta (§9.15).
 */
export function Tabla<T>({ columnas, filas, claveFila, descripcion, className }: TablaProps<T>) {
  return (
    <div className={className}>
      <div className="hidden overflow-x-auto border-2 border-slate-900 bg-white shadow-brutal md:block">
        <table className="w-full border-collapse text-sm">
          {descripcion !== undefined && <caption className="sr-only">{descripcion}</caption>}
          <thead className="bg-slate-900 text-white">
            <tr>
              {columnas.map((columna) => (
                <th
                  key={columna.encabezado}
                  scope="col"
                  className={clsx(
                    'px-4 py-3 font-mono text-xs font-bold uppercase tracking-widest',
                    ALINEACION[columna.alinear ?? 'inicio'],
                  )}
                >
                  {columna.encabezado}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filas.map((fila) => (
              <tr
                key={claveFila(fila)}
                className="border-t-2 border-slate-900 transition-colors odd:bg-white even:bg-slate-50 hover:bg-marca-50"
              >
                {columnas.map((columna) => (
                  <td
                    key={columna.encabezado}
                    className={clsx('px-4 py-3 align-middle', ALINEACION[columna.alinear ?? 'inicio'])}
                  >
                    {columna.celda(fila)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul aria-label={descripcion} className="flex flex-col gap-4 md:hidden">
        {filas.map((fila) => (
          <li key={claveFila(fila)} className="marco-brutal-sm bg-white">
            <dl className="divide-y-2 divide-slate-900">
              {columnas.map((columna) => (
                <div key={columna.encabezado} className="flex items-center justify-between gap-4 px-4 py-2.5">
                  <dt className="font-mono text-[11px] font-bold uppercase tracking-widest text-slate-500">
                    {columna.encabezado}
                  </dt>
                  <dd className="text-right text-sm">{columna.celda(fila)}</dd>
                </div>
              ))}
            </dl>
          </li>
        ))}
      </ul>
    </div>
  )
}
