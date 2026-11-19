import { clsx } from 'clsx'
import { MENSAJE_ERROR_GENERICO } from '../lib/http'
import { Boton } from './Boton'
import { IconoAlerta } from './Iconos'

export interface EstadoErrorProps {
  titulo?: string
  mensaje?: string
  onReintentar?: () => void
  className?: string
}

export function EstadoError({
  titulo = 'Algo salió mal',
  mensaje = MENSAJE_ERROR_GENERICO,
  onReintentar,
  className,
}: EstadoErrorProps) {
  return (
    <section
      role="alert"
      className={clsx(
        'flex flex-col items-center gap-4 border-2 border-slate-900 bg-red-50 px-6 py-10 text-center shadow-brutal',
        className,
      )}
    >
      <div className="grid size-14 rotate-3 place-items-center border-2 border-slate-900 bg-red-600 text-white shadow-brutal-sm">
        <IconoAlerta className="size-7" />
      </div>
      <h2 className="font-titulo text-xl font-extrabold uppercase">{titulo}</h2>
      <p className="max-w-md text-slate-700">{mensaje}</p>
      {onReintentar !== undefined && (
        <Boton variante="secundario" onClick={onReintentar}>
          Reintentar
        </Boton>
      )}
    </section>
  )
}
