import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http as mswHttp, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { USUARIOS_PERFIL_DEMO } from '../../../test/mocks/handlers'
import { server } from '../../../test/mocks/server'
import { renderConProveedores } from '../../../test/utils'

describe('Cuenta y Perfil de Usuario — Decisiones C-01 y C-05 (Etapa 6)', () => {
  it('TEST-FE-USR-001: /cuenta consulta GET /api/users/{username} (C-05), muestra username, email, estado Activo y roles de AuthContext (C-01)', async () => {
    let rutaConsultada = ''
    server.use(
      mswHttp.get('/api/users/:username', ({ request, params }) => {
        rutaConsultada = new URL(request.url).pathname
        const username = String(params.username ?? '')
        return HttpResponse.json(
          USUARIOS_PERFIL_DEMO[username] ?? {
            username,
            email: 'andrea@pulsepass.co',
            active: true,
          },
        )
      }),
    )

    renderConProveedores({
      rutaInicial: '/cuenta',
      tokenInicial: 'jwt-user-token',
    })

    expect(await screen.findByRole('heading', { name: 'Mi cuenta' })).toBeInTheDocument()
    expect(await screen.findByText('Activo')).toBeInTheDocument()
    expect(rutaConsultada).toBe('/api/users/andrea')
    expect(screen.getAllByText('andrea').length).toBeGreaterThan(0)
    expect(screen.getAllByText('andrea@pulsepass.co').length).toBeGreaterThan(0)
    expect(screen.getByText('USER')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /ver mis tickets/i })).toHaveAttribute(
      'href',
      '/mis-tickets',
    )
  })

  it('TEST-FE-USR-002: /cuenta muestra estado de error y permite reintentar la carga del perfil', async () => {
    const usuario = userEvent.setup()
    let intentos = 0

    server.use(
      mswHttp.get('/api/users/:username', () => {
        intentos += 1
        if (intentos <= 2) {
          return HttpResponse.json(
            {
              timestamp: '2026-11-19T00:00:00',
              status: 500,
              error: 'Internal Server Error',
              message: 'No se pudo cargar el perfil del usuario',
              details: {},
            },
            { status: 500 },
          )
        }
        return HttpResponse.json(USUARIOS_PERFIL_DEMO.andrea)
      }),
    )

    renderConProveedores({
      rutaInicial: '/cuenta',
      tokenInicial: 'jwt-user-token',
    })

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'No se pudo cargar el perfil del usuario',
    )
    await usuario.click(screen.getByRole('button', { name: 'Reintentar' }))
    expect(await screen.findByText('Activo')).toBeInTheDocument()
  })
})
