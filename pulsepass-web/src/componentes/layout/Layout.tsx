import { Outlet } from 'react-router'
import { Footer } from './Footer'
import { Navbar } from './Navbar'

export function Layout() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:border-2 focus:border-slate-900 focus:bg-amber-300 focus:px-4 focus:py-2 focus:font-titulo focus:font-bold"
      >
        Saltar al contenido
      </a>
      <Navbar />
      <main id="contenido" className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export default Layout
