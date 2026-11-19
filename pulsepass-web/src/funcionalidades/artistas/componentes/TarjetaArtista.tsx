import { Link } from 'react-router'
import { Badge } from '../../../componentes/Badge'
import { IconoFlechaDerecha } from '../../../componentes/Iconos'
import { Tarjeta } from '../../../componentes/Tarjeta'
import { RUTAS } from '../../../lib/rutas'
import { obtenerInicialesArtista } from '../iniciales'
import type { ArtistResponse } from '../tipos'

export interface TarjetaArtistaProps {
  artista: ArtistResponse
}

export function TarjetaArtista({ artista }: TarjetaArtistaProps) {
  const iniciales = obtenerInicialesArtista(artista.stageName)

  return (
    <Link
      to={RUTAS.artista(artista.id)}
      className="group block h-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-marca-600"
    >
      <Tarjeta interactiva3D className="flex h-full flex-col justify-between gap-4">
        <div className="flex items-start justify-between gap-3">
          <div
            aria-hidden="true"
            className="grid size-16 shrink-0 place-items-center border-2 border-slate-900 bg-amber-300 font-titulo text-2xl font-extrabold uppercase text-slate-900 shadow-brutal-sm group-hover:bg-marca-600 group-hover:text-white"
          >
            {iniciales}
          </div>
          <Badge
            colores={
              artista.active
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-slate-200 text-slate-700'
            }
          >
            {artista.active ? 'Activo' : 'Inactivo'}
          </Badge>
        </div>

        <div>
          <p className="font-mono text-xs font-bold uppercase tracking-widest text-slate-500">
            ART-{String(artista.id).padStart(3, '0')}
          </p>
          <h3 className="mt-1 font-titulo text-xl font-extrabold uppercase group-hover:text-marca-600">
            {artista.stageName}
          </h3>
        </div>

        <div className="flex items-center justify-between border-t-2 border-slate-900 pt-3 font-titulo text-xs font-bold uppercase tracking-wider">
          <span>Ver perfil y fechas</span>
          <IconoFlechaDerecha className="size-4 transition-transform group-hover:translate-x-1" />
        </div>
      </Tarjeta>
    </Link>
  )
}
