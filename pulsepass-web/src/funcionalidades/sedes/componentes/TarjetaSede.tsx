import { Link } from 'react-router'
import { Badge } from '../../../componentes/Badge'
import { CodigoTexto } from '../../../componentes/CodigoTexto'
import { IconoFlechaDerecha, IconoSede } from '../../../componentes/Iconos'
import { Tarjeta } from '../../../componentes/Tarjeta'
import { RUTAS } from '../../../lib/rutas'
import type { VenueResponse } from '../tipos'

export interface TarjetaSedeProps {
  sede: VenueResponse
}

export function TarjetaSede({ sede }: TarjetaSedeProps) {
  return (
    <Link
      to={RUTAS.sede(sede.code)}
      className="group block h-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-marca-600"
    >
      <Tarjeta interactiva3D className="flex h-full flex-col justify-between gap-4">
        <div className="flex items-start justify-between gap-3">
          <CodigoTexto codigo={sede.code} />
          <Badge
            colores={
              sede.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
            }
          >
            {sede.active ? 'Activa' : 'Inactiva'}
          </Badge>
        </div>

        <div>
          <h3 className="font-titulo text-xl font-extrabold uppercase group-hover:text-marca-600">
            {sede.name}
          </h3>
          <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-slate-700">
            <IconoSede className="size-4 text-acento-500" />
            <span>{sede.city}</span>
          </p>
        </div>

        <div className="flex items-center justify-between border-t-2 border-slate-900 pt-3 text-xs">
          <span className="font-mono font-bold uppercase text-slate-700">
            Capacidad: {sede.capacity.toLocaleString('es-CO')} personas
          </span>
          <IconoFlechaDerecha className="size-4 transition-transform group-hover:translate-x-1" />
        </div>
      </Tarjeta>
    </Link>
  )
}
