import { clsx } from 'clsx'
import { useId, type ComponentProps } from 'react'
import { CLASE_CONTROL, CLASE_CONTROL_ERROR, EnvolturaCampo } from './EnvolturaCampo'

export interface CampoProps extends ComponentProps<'input'> {
  etiqueta: string
  error?: string
  ayuda?: string
  claseContenedor?: string
}

export function Campo({ etiqueta, error, ayuda, claseContenedor, id, className, ...resto }: CampoProps) {
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
      <input
        id={idControl}
        aria-invalid={Boolean(error)}
        aria-describedby={tieneMensaje ? idMensaje : undefined}
        className={clsx(CLASE_CONTROL, error && CLASE_CONTROL_ERROR, className)}
        {...resto}
      />
    </EnvolturaCampo>
  )
}
