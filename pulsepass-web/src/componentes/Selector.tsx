import { clsx } from 'clsx'
import { useId, type ComponentProps } from 'react'
import { CLASE_CONTROL, CLASE_CONTROL_ERROR, EnvolturaCampo } from './EnvolturaCampo'

export interface OpcionSelector {
  valor: string
  etiqueta: string
}

export interface SelectorProps extends ComponentProps<'select'> {
  etiqueta: string
  opciones: readonly OpcionSelector[]
  error?: string
  ayuda?: string
  /** Texto de la opción vacía inicial (p. ej. "Selecciona una sede"). */
  marcador?: string
  claseContenedor?: string
}

export function Selector({
  etiqueta,
  opciones,
  error,
  ayuda,
  marcador,
  claseContenedor,
  id,
  className,
  ...resto
}: SelectorProps) {
  const idGenerado = useId()
  const idControl = id ?? idGenerado
  const idMensaje = `${idControl}-mensaje`
  const tieneMensaje = Boolean(error ?? ayuda)

  return (
    <EnvolturaCampo
      idControl={idControl}
      idMensaje={idMensaje}
      etiqueta={etiqueta}
      error={error}
      ayuda={ayuda}
      className={claseContenedor}
    >
      <select
        id={idControl}
        aria-invalid={Boolean(error)}
        aria-describedby={tieneMensaje ? idMensaje : undefined}
        className={clsx(CLASE_CONTROL, 'cursor-pointer', error && CLASE_CONTROL_ERROR, className)}
        {...resto}
      >
        {marcador !== undefined && <option value="">{marcador}</option>}
        {opciones.map((opcion) => (
          <option key={opcion.valor} value={opcion.valor}>
            {opcion.etiqueta}
          </option>
        ))}
      </select>
    </EnvolturaCampo>
  )
}
