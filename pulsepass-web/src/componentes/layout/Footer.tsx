import { Link } from 'react-router'
import { RUTAS } from '../../lib/rutas'

export function Footer() {
  return (
    <footer className="mt-auto border-t-2 border-slate-900 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-6 text-sm sm:flex-row">
        <p className="font-mono text-xs font-bold uppercase tracking-wider text-slate-700">
          © 2026 PulsePass · Caso de estudio académico
        </p>
        <div className="flex items-center gap-4 font-titulo text-xs font-bold uppercase">
          <Link to={RUTAS.eventos} className="hover:text-marca-600 hover:underline">
            Eventos
          </Link>
          <Link to={RUTAS.artistas} className="hover:text-marca-600 hover:underline">
            Artistas
          </Link>
          <Link to={RUTAS.sedes} className="hover:text-marca-600 hover:underline">
            Sedes
          </Link>
        </div>
      </div>
    </footer>
  )
}
