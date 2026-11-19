import { createBrowserRouter, createMemoryRouter, type RouteObject } from 'react-router'
import { Cargando } from './componentes/Cargando'
import { RutaPorRol } from './componentes/guardas/RutaPorRol'
import { RutaProtegida } from './componentes/guardas/RutaProtegida'
import { SoloAnonimo } from './componentes/guardas/SoloAnonimo'
import { Layout } from './componentes/layout/Layout'
import { ErrorPagina } from './pages/ErrorPagina'
import { Inicio } from './pages/Inicio'

export const rutasApp: RouteObject[] = [
  {
    path: '/',
    Component: Layout,
    ErrorBoundary: ErrorPagina,
    HydrateFallback: Cargando,
    children: [
      {
        index: true,
        Component: Inicio,
      },
      {
        path: 'eventos',
        lazy: async () => ({ Component: (await import('./pages/CatalogoEventos')).default }),
      },
      {
        path: 'eventos/:eventCode',
        lazy: async () => ({ Component: (await import('./pages/DetalleEvento')).default }),
      },
      {
        path: 'artistas',
        lazy: async () => ({ Component: (await import('./pages/ListaArtistas')).default }),
      },
      {
        path: 'artistas/:id',
        lazy: async () => ({ Component: (await import('./pages/DetalleArtista')).default }),
      },
      {
        path: 'sedes',
        lazy: async () => ({ Component: (await import('./pages/ListaSedes')).default }),
      },
      {
        path: 'sedes/:code',
        lazy: async () => ({ Component: (await import('./pages/DetalleSede')).default }),
      },
      {
        Component: SoloAnonimo,
        children: [
          {
            path: 'login',
            lazy: async () => ({ Component: (await import('./pages/Login')).default }),
          },
          {
            path: 'registro',
            lazy: async () => ({ Component: (await import('./pages/Registro')).default }),
          },
        ],
      },
      {
        Component: RutaProtegida,
        children: [
          {
            path: 'cuenta',
            lazy: async () => ({ Component: (await import('./pages/Cuenta')).default }),
          },
          {
            element: <RutaPorRol rolesPermitidos={['USER']} />,
            children: [
              {
                path: 'mis-tickets',
                lazy: async () => ({ Component: (await import('./pages/MisTickets')).default }),
              },
              {
                path: 'mis-tickets/:ticketCode',
                lazy: async () => ({ Component: (await import('./pages/DetalleTicket')).default }),
              },
              {
                path: 'compra/confirmacion/:ticketCode',
                lazy: async () => ({
                  Component: (await import('./pages/ConfirmacionCompra')).default,
                }),
              },
            ],
          },
          {
            element: <RutaPorRol rolesPermitidos={['STAFF', 'ADMIN']} />,
            children: [
              {
                path: 'staff/validacion',
                lazy: async () => ({
                  Component: (await import('./pages/ValidacionIngreso')).default,
                }),
              },
              {
                path: 'staff/eventos/:eventCode/tickets',
                lazy: async () => ({
                  Component: (await import('./pages/TicketsPagadosEvento')).default,
                }),
              },
            ],
          },
          {
            element: <RutaPorRol rolesPermitidos={['ADMIN']} />,
            children: [
              {
                path: 'admin/eventos',
                lazy: async () => ({ Component: (await import('./pages/AdminEventos')).default }),
              },
              {
                path: 'admin/eventos/nuevo',
                lazy: async () => ({
                  Component: (await import('./pages/AdminCrearEvento')).default,
                }),
              },
              {
                path: 'admin/eventos/:eventCode',
                lazy: async () => ({
                  Component: (await import('./pages/AdminGestionEvento')).default,
                }),
              },
            ],
          },
        ],
      },
      {
        path: '403',
        lazy: async () => ({ Component: (await import('./pages/SinPermisos')).default }),
      },
      {
        path: '*',
        lazy: async () => ({ Component: (await import('./pages/NoEncontrada')).default }),
      },
    ],
  },
]

export function crearRouterApp() {
  return createBrowserRouter(rutasApp)
}

export function crearRouterMemoria(rutasIniciales: string[] = ['/']) {
  return createMemoryRouter(rutasApp, {
    initialEntries: rutasIniciales,
  })
}
