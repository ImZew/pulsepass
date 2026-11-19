import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http as mswHttp, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { TICKETS_DEMO } from '../../../test/mocks/handlers'
import { server } from '../../../test/mocks/server'
import { renderConProveedores } from '../../../test/utils'
import type { TicketResponse } from '../tipos'

describe('Experiencia USER — Compra, Confirmación, Mis Tickets, Detalle y Cancelación (Etapa 6)', () => {
  it('TEST-FE-TKT-001a: compra exitosa con 201 vacío (C-04) envía userEmail de AuthContext, hace refetch a by-user y navega a /compra/confirmacion/:ticketCode', async () => {
    const usuario = userEvent.setup()
    let payloadEnviado: unknown = null

    server.use(
      mswHttp.post('/api/tickets', async ({ request }) => {
        payloadEnviado = await request.json()
        return new HttpResponse(null, { status: 201 })
      }),
    )

    const { router } = renderConProveedores({
      rutaInicial: '/eventos/CMF-2026',
      tokenInicial: 'jwt-user-token',
    })

    expect(
      await screen.findByRole('heading', { name: 'Caribbean Music Fest 2026' }),
    ).toBeInTheDocument()

    await usuario.click(screen.getByRole('link', { name: /comprar ticket/i }))

    const dialogo = await screen.findByRole('dialog', { name: 'Confirmar compra' })
    const selectorTipo = within(dialogo).getByLabelText('Tipo de ticket')
    await usuario.selectOptions(selectorTipo, 'VIP')

    await usuario.click(within(dialogo).getByRole('button', { name: 'Confirmar compra' }))

    expect(
      await screen.findByRole('heading', { name: 'Confirmación de compra' }),
    ).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/compra/confirmacion/TKT-CMF-001')
    expect(payloadEnviado).toEqual({
      userEmail: 'andrea@pulsepass.co',
      eventCode: 'CMF-2026',
      type: 'VIP',
    })
    expect(screen.getByRole('status')).toHaveTextContent('¡Compra confirmada!')
    expect(screen.getAllByText('TKT-CMF-001').length).toBeGreaterThan(0)
  })

  it('TEST-FE-TKT-001b: compra exitosa cuando el 201 devuelve JSON con ticketCode navega directo a /compra/confirmacion/:ticketCode', async () => {
    const usuario = userEvent.setup()
    const ticketNuevo: TicketResponse = {
      id: 777,
      ticketCode: 'TKT-DIRECTO-777',
      type: 'BACKSTAGE',
      price: 520000,
      status: 'PAID',
      purchaseDate: '2026-11-19T10:00:00',
      userEmail: 'andrea@pulsepass.co',
      eventCode: 'CMF-2026',
      eventName: 'Caribbean Music Fest 2026',
    }

    server.use(
      mswHttp.post('/api/tickets', () => HttpResponse.json(ticketNuevo, { status: 201 })),
      mswHttp.get('/api/tickets/TKT-DIRECTO-777', () => HttpResponse.json(ticketNuevo)),
    )

    const { router } = renderConProveedores({
      rutaInicial: '/eventos/CMF-2026?comprar=BACKSTAGE',
      tokenInicial: 'jwt-user-token',
    })

    const dialogo = await screen.findByRole('dialog', { name: 'Confirmar compra' })
    await usuario.click(within(dialogo).getByRole('button', { name: 'Confirmar compra' }))

    expect(
      await screen.findByRole('heading', { name: 'Confirmación de compra' }),
    ).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/compra/confirmacion/TKT-DIRECTO-777')
    expect(screen.getAllByText('TKT-DIRECTO-777').length).toBeGreaterThan(0)
  })

  it('TEST-FE-TKT-002: compra con 409 Conflict (edad mínima o sin aforo) mantiene el modal abierto y muestra el mensaje exacto del backend', async () => {
    const usuario = userEvent.setup()

    server.use(
      mswHttp.post('/api/tickets', () =>
        HttpResponse.json(
          {
            timestamp: '2026-11-19T00:00:00',
            status: 409,
            error: 'Conflict',
            message: 'User does not meet minimum age requirement for this event',
            details: {},
          },
          { status: 409 },
        ),
      ),
    )

    const { router } = renderConProveedores({
      rutaInicial: '/eventos/CMF-2026',
      tokenInicial: 'jwt-user-token',
    })

    expect(
      await screen.findByRole('heading', { name: 'Caribbean Music Fest 2026' }),
    ).toBeInTheDocument()

    await usuario.click(screen.getByRole('link', { name: /comprar ticket/i }))
    const dialogo = await screen.findByRole('dialog', { name: 'Confirmar compra' })

    await usuario.click(within(dialogo).getByRole('button', { name: 'Confirmar compra' }))

    expect(await within(dialogo).findByRole('alert')).toHaveTextContent(
      'User does not meet minimum age requirement for this event',
    )
    expect(screen.getByRole('dialog', { name: 'Confirmar compra' })).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/eventos/CMF-2026')
  })

  it('TEST-FE-TKT-003: usuario anónimo en detalle de evento redirige a /login con state.desde; STAFF sin rol USER no ve panel de compra', async () => {
    const usuario = userEvent.setup()
    const vistaAnonima = renderConProveedores({
      rutaInicial: '/eventos/CMF-2026',
    })

    expect(
      await screen.findByRole('heading', { name: 'Caribbean Music Fest 2026' }),
    ).toBeInTheDocument()

    await usuario.click(screen.getByRole('button', { name: 'Inicia sesión para comprar' }))
    expect(await screen.findByRole('heading', { name: 'Inicia sesión' })).toBeInTheDocument()
    expect(vistaAnonima.router.state.location.pathname).toBe('/login')
    expect(vistaAnonima.router.state.location.state).toMatchObject({
      desde: '/eventos/CMF-2026',
    })
    vistaAnonima.unmount()

    renderConProveedores({
      rutaInicial: '/eventos/CMF-2026',
      tokenInicial: 'jwt-staff-token',
    })

    expect(
      await screen.findByRole('heading', { name: 'Caribbean Music Fest 2026' }),
    ).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /comprar ticket/i })).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: /inicia sesión para comprar/i }),
    ).not.toBeInTheDocument()
  })

  it('TEST-FE-TKT-004: confirmación de compra (/compra/confirmacion/:ticketCode) carga ticket desde GET /api/tickets/{ticketCode}, muestra Boleto3D, código copiable y enlaces', async () => {
    const usuario = userEvent.setup()

    renderConProveedores({
      rutaInicial: '/compra/confirmacion/TKT-CMF-001',
      tokenInicial: 'jwt-user-token',
    })

    expect(
      await screen.findByRole('heading', { name: 'Confirmación de compra' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('¡Compra confirmada!')
    expect(screen.getAllByText('Caribbean Music Fest 2026').length).toBeGreaterThan(0)
    expect(screen.getByText(/350\.000/)).toBeInTheDocument()

    await usuario.click(screen.getByRole('button', { name: 'Copiar' }))
    expect(await screen.findByRole('button', { name: 'Copiado' })).toBeInTheDocument()

    expect(screen.getByRole('link', { name: 'Ver mis tickets' })).toHaveAttribute(
      'href',
      '/mis-tickets',
    )
    expect(screen.getByRole('link', { name: 'Explorar más eventos' })).toHaveAttribute(
      'href',
      '/eventos',
    )
  })

  it('TEST-FE-TKT-005: /mis-tickets lista tickets del usuario, filtra por estado y maneja estado vacío y error con reintento', async () => {
    const usuario = userEvent.setup()

    const vista = renderConProveedores({
      rutaInicial: '/mis-tickets',
      tokenInicial: 'jwt-user-token',
    })

    expect(await screen.findByRole('heading', { name: 'Mis tickets' })).toBeInTheDocument()
    expect(await screen.findByText('TKT-CMF-001')).toBeInTheDocument()
    expect(screen.getByText('TKT-TECH-002')).toBeInTheDocument()
    expect(screen.getByText('TKT-CMF-003')).toBeInTheDocument()

    // Filtrar por USED mediante el selector
    await usuario.selectOptions(screen.getByLabelText('Estado'), 'USED')
    expect(screen.getByText('TKT-TECH-002')).toBeInTheDocument()
    expect(screen.queryByText('TKT-CMF-001')).not.toBeInTheDocument()

    // Filtrar por RESERVED (sin boletos en ese estado)
    await usuario.click(screen.getByRole('button', { name: 'RESERVED' }))
    expect(
      await screen.findByRole('heading', { name: 'Sin tickets en este estado' }),
    ).toBeInTheDocument()

    // Volver a TODOS
    await usuario.click(screen.getByRole('button', { name: 'Ver todos los tickets' }))
    expect(screen.getByText('TKT-CMF-001')).toBeInTheDocument()
    vista.unmount()

    // Caso lista vacía del servidor
    server.use(mswHttp.get('/api/tickets/by-user', () => HttpResponse.json([])))
    const vistaVacia = renderConProveedores({
      rutaInicial: '/mis-tickets',
      tokenInicial: 'jwt-user-token',
    })

    expect(
      await screen.findByRole('heading', { name: 'Aún no tienes tickets' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Ver cartelera' })).toHaveAttribute(
      'href',
      '/eventos',
    )
    vistaVacia.unmount()

    // Caso error 500 con reintento exitoso (1 intento inicial + 1 reintento automático de QueryClient)
    let intentos = 0
    server.use(
      mswHttp.get('/api/tickets/by-user', () => {
        intentos += 1
        if (intentos <= 2) {
          return HttpResponse.json(
            {
              timestamp: '2026-11-19T00:00:00',
              status: 500,
              error: 'Internal Server Error',
              message: 'Error temporal cargando tickets',
              details: {},
            },
            { status: 500 },
          )
        }
        return HttpResponse.json(TICKETS_DEMO)
      }),
    )

    renderConProveedores({
      rutaInicial: '/mis-tickets',
      tokenInicial: 'jwt-user-token',
    })

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Error temporal cargando tickets',
    )
    await usuario.click(screen.getByRole('button', { name: 'Reintentar' }))
    expect(await screen.findByText('TKT-CMF-001')).toBeInTheDocument()
  })

  it('TEST-FE-TKT-006: detalle de ticket (/mis-tickets/:ticketCode) cancela exitosamente con PATCH .../cancel (200), cierra modal, refresca estado a CANCELLED y muestra aviso de éxito', async () => {
    const usuario = userEvent.setup()
    let cancelado = false

    server.use(
      mswHttp.get('/api/tickets/TKT-CMF-001', () =>
        HttpResponse.json({
          ...TICKETS_DEMO[0]!,
          status: cancelado ? 'CANCELLED' : 'PAID',
        }),
      ),
      mswHttp.patch('/api/tickets/TKT-CMF-001/cancel', () => {
        cancelado = true
        return new HttpResponse(null, { status: 200 })
      }),
    )

    renderConProveedores({
      rutaInicial: '/mis-tickets/TKT-CMF-001',
      tokenInicial: 'jwt-user-token',
    })

    expect(
      await screen.findByRole('heading', { name: 'Detalle de ticket' }),
    ).toBeInTheDocument()
    expect(screen.getAllByText('PAID').length).toBeGreaterThan(0)

    await usuario.click(screen.getByRole('button', { name: 'Cancelar ticket' }))
    const dialogo = await screen.findByRole('dialog', { name: 'Confirmar cancelación' })

    await usuario.click(
      within(dialogo).getByRole('button', { name: 'Confirmar cancelación' }),
    )

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(await screen.findByRole('status')).toHaveTextContent(
      'El ticket TKT-CMF-001 fue cancelado exitosamente.',
    )
    expect(screen.getAllByText('CANCELLED').length).toBeGreaterThan(0)
  })

  it('TEST-FE-TKT-007: cancelación rechazada con 409 Conflict mantiene el modal abierto y muestra el mensaje exacto del backend en role="alert"', async () => {
    const usuario = userEvent.setup()

    renderConProveedores({
      rutaInicial: '/mis-tickets/TKT-TECH-002',
      tokenInicial: 'jwt-user-token',
    })

    expect(
      await screen.findByRole('heading', { name: 'Detalle de ticket' }),
    ).toBeInTheDocument()

    await usuario.click(screen.getByRole('button', { name: 'Cancelar ticket' }))
    const dialogo = await screen.findByRole('dialog', { name: 'Confirmar cancelación' })

    await usuario.click(
      within(dialogo).getByRole('button', { name: 'Confirmar cancelación' }),
    )

    expect(await within(dialogo).findByRole('alert')).toHaveTextContent(
      'Used tickets cannot be cancelled',
    )
    expect(screen.getByRole('dialog', { name: 'Confirmar cancelación' })).toBeInTheDocument()
  })

  it('TEST-FE-TKT-008: detalle de ticket maneja 403 (ticket ajeno) y 404 (inexistente) con enlace para volver a /mis-tickets', async () => {
    const vista403 = renderConProveedores({
      rutaInicial: '/mis-tickets/TKT-AJENO-999',
      tokenInicial: 'jwt-user-token',
    })

    expect(
      await screen.findByRole('heading', {
        name: 'No tienes permiso para ver este ticket',
      }),
    ).toBeInTheDocument()
    expect(screen.getByText('Access denied to this ticket')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Volver a mis tickets' })).toHaveAttribute(
      'href',
      '/mis-tickets',
    )
    vista403.unmount()

    renderConProveedores({
      rutaInicial: '/mis-tickets/TKT-NO-EXISTE',
      tokenInicial: 'jwt-user-token',
    })

    expect(
      await screen.findByRole('heading', { name: 'Ticket no encontrado' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Volver a mis tickets' })).toHaveAttribute(
      'href',
      '/mis-tickets',
    )
  })
})
