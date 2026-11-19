import { Link } from 'react-router'
import { BadgeCategoria, BadgeEstadoEvento } from '../../../componentes/Badge'
import {
  IconoCalendario,
  IconoCategoria,
  IconoFlechaDerecha,
  IconoMusica,
  IconoSede,
} from '../../../componentes/Iconos'
import { Tarjeta } from '../../../componentes/Tarjeta'
import { formatearFechaEvento } from '../../../lib/formato'
import { RUTAS } from '../../../lib/rutas'
import type { EventCategory } from '../../../lib/tipos'
import type { EventSummaryResponse } from '../tipos'

const PANEL_CATEGORIA: Record<EventCategory, string> = {
  MUSIC: 'bg-marca-600 text-white',
  SPORTS: 'bg-lime-400 text-slate-900',
  TECHNOLOGY: 'bg-cyan-400 text-slate-900',
  EDUCATION: 'bg-amber-300 text-slate-900',
  CULTURE: 'bg-fuchsia-500 text-white',
  ENTERTAINMENT: 'bg-acento-500 text-white',
}

export interface TarjetaEventoProps {
  evento: EventSummaryResponse
}

export function TarjetaEvento({ evento }: TarjetaEventoProps) {
  const claseCabecera =
    evento.category !== undefined
      ? PANEL_CATEGORIA[evento.category]
      : 'bg-slate-900 text-amber-300'

  return (
    <Link
      to={RUTAS.evento(evento.eventCode)}
      className="group block h-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-marca-600"
    >
      <Tarjeta interactiva3D className="flex h-full flex-col justify-between p-0 overflow-hidden">
        <div>
          {/* Cabecera gráfica por categoría (DES-02) */}
          <div
            className={`flex items-center justify-between border-b-2 border-slate-900 px-5 py-4 ${claseCabecera}`}
          >
            <span className="border-2 border-slate-900 bg-white px-2 py-0.5 font-mono text-xs font-extrabold tracking-wider text-slate-900">
              {evento.eventCode}
            </span>
            <div className="grid size-10 place-items-center border-2 border-slate-900 bg-white text-slate-900 shadow-brutal-sm">
              {evento.category !== undefined ? (
                <IconoCategoria categoria={evento.category} className="size-5" />
              ) : (
                <IconoMusica className="size-5" />
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3 p-5">
            <div className="flex flex-wrap items-center gap-2">
              <BadgeEstadoEvento estado={evento.status} />
              {evento.category !== undefined && <BadgeCategoria categoria={evento.category} />}
            </div>

            <h3 className="font-titulo text-xl font-extrabold uppercase leading-snug group-hover:text-marca-600">
              {evento.name}
            </h3>

            <dl className="mt-1 flex flex-col gap-1.5 text-sm text-slate-700">
              <div className="flex items-center gap-2">
                <dt className="sr-only">Fecha</dt>
                <IconoCalendario className="size-4 shrink-0 text-marca-600" />
                <dd className="font-mono text-xs font-bold">
                  {formatearFechaEvento(evento.eventDate)}
                </dd>
              </div>
              <div className="flex items-center gap-2">
                <dt className="sr-only">Sede</dt>
                <IconoSede className="size-4 shrink-0 text-acento-500" />
                <dd className="font-medium">
                  {evento.venueName}
                  {evento.city ? ` · ${evento.city}` : ''}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="flex items-center justify-between border-t-2 border-slate-900 bg-slate-50 px-5 py-3 font-titulo text-xs font-bold uppercase tracking-wider group-hover:bg-amber-300">
          <span>Ver evento</span>
          <IconoFlechaDerecha className="size-4 transition-transform group-hover:translate-x-1" />
        </div>
      </Tarjeta>
    </Link>
  )
}
