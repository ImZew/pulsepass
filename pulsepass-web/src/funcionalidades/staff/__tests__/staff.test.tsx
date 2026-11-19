import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http as mswHttp, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { TICKETS_DEMO } from '../../../test/mocks/handlers'
import { server } from '../../../test/mocks/server'
import { renderConProveedores } from '../../../test/utils'

describe('Panel Operativo STAFF / ADMIN — Validación de ingreso y Tickets pagados (Etapa 7)', () => {
  it('TEST-FE-STF-001: búsqueda exitosa de ticket por código (con trim automático) muestra la ficha operativa completa', async () => {
    const usuario = userEvent.setup()

    renderConProveedores({
      rutaInicial: '/staff/validacion',
      tokenInicial: 'jwt-staff-token',
    })

    expect(
      await screen.findByRole('heading', { name: 'Validación de ingreso' }),
    ).toBeInTheDocument()

    const campoCodigo = screen.getByLabelText('Código del ticket')
    await usuario.type(campoCodigo, '   TKT-CMF-001   ')
    await usuario.click(screen.getByRole('button', { name: /buscar ticket/i }))

    expect(
      await screen.findByRole('heading', { name: 'Caribbean Music Fest 2026' }),
    ).toBeInTheDocument()
    expect(screen.getAllByText('TKT-CMF-001').length).toBeGreaterThan(0)
    expect(screen.getByText('andrea@pulsepass.co')).toBeInTheDocument()
    expect(screen.getByText(/VIP \(VIP\)/i)).toBeInTheDocument()
    expect(screen.getByText(/350\.000/)).toBeInTheDocument()
    expect(screen.getAllByText('PAID').length).toBeGreaterThan(0)
    expect(
      screen.getByRole('button', { name: /marcar como usado/i }),
    ).toBeInTheDocument()
  })

  it('TEST-FE-STF-002: búsqueda de ticket inexistente (404) muestra Aviso de error indicando que el ticket no existe', async () => {
    const usuario = userEvent.setup()

    renderConProveedores({
      rutaInicial: '/staff/validacion',
      tokenInicial: 'jwt-staff-token',
    })

    expect(
      await screen.findByRole('heading', { name: 'Validación de ingreso' }),
    ).toBeInTheDocument()

    await usuario.type(screen.getByLabelText('Código del ticket'), 'TKT-INEXISTENTE-404')
    await usuario.click(screen.getByRole('button', { name: /buscar ticket/i }))

    const alerta = await screen.findByRole('alert')
    expect(alerta).toHaveTextContent('Ticket no encontrado')
    expect(alerta).toHaveTextContent('TKT-INEXISTENTE-404')
    expect(alerta).toHaveTextContent('Ticket not found: TKT-INEXISTENTE-404')
  })

  it('TEST-FE-STF-003: marcar ticket como usado (PATCH /api/tickets/{ticketCode}/use -> 200) actualiza el estado en pantalla a USED y muestra aviso de éxito', async () => {
    const usuario = userEvent.setup()
    let usadoEnServidor = false

    server.use(
      mswHttp.get('/api/tickets/TKT-CMF-001', () =>
        HttpResponse.json({
          ...TICKETS_DEMO[0]!,
          status: usadoEnServidor ? 'USED' : 'PAID',
        }),
      ),
      mswHttp.patch('/api/tickets/TKT-CMF-001/use', () => {
        usadoEnServidor = true
        return new HttpResponse(null, { status: 200 })
      }),
    )

    renderConProveedores({
      rutaInicial: '/staff/validacion',
      tokenInicial: 'jwt-staff-token',
    })

    expect(
      await screen.findByRole('heading', { name: 'Validación de ingreso' }),
    ).toBeInTheDocument()

    await usuario.type(screen.getByLabelText('Código del ticket'), 'TKT-CMF-001')
    await usuario.click(screen.getByRole('button', { name: /buscar ticket/i }))

    expect(
      await screen.findByRole('heading', { name: 'Caribbean Music Fest 2026' }),
    ).toBeInTheDocument()
    expect(screen.getAllByText('PAID').length).toBeGreaterThan(0)

    await usuario.click(screen.getByRole('button', { name: /marcar como usado/i }))

    const confirmacion = await screen.findByRole('status')
    expect(confirmacion).toHaveTextContent('Ingreso registrado')
    expect(confirmacion).toHaveTextContent(
      'El ticket TKT-CMF-001 fue marcado como usado (USED) exitosamente.',
    )
    expect(screen.getAllByText('USED').length).toBeGreaterThan(0)
  })

  it('TEST-FE-STF-004: error 409 Conflict al intentar marcar como usado un ticket ya usado o cancelado muestra literal el mensaje del backend', async () => {
    const usuario = userEvent.setup()

    renderConProveedores({
      rutaInicial: '/staff/validacion',
      tokenInicial: 'jwt-admin-token',
    })

    expect(
      await screen.findByRole('heading', { name: 'Validación de ingreso' }),
    ).toBeInTheDocument()

    // Consultar ticket ya usado (TKT-TECH-002)
    const campoCodigo = screen.getByLabelText('Código del ticket')
    await usuario.type(campoCodigo, 'TKT-TECH-002')
    await usuario.click(screen.getByRole('button', { name: /buscar ticket/i }))

    expect(
      await screen.findByRole('heading', { name: 'Caribe Tech Summit 2026' }),
    ).toBeInTheDocument()

    // La UI no bloquea el botón; delega la validación al backend
    await usuario.click(screen.getByRole('button', { name: /marcar como usado/i }))

    const alertaUsado = await screen.findByRole('alert')
    expect(alertaUsado).toHaveTextContent('Only PAID tickets can be marked as USED')

    // Consultar ticket cancelado (TKT-CMF-003)
    await usuario.clear(campoCodigo)
    await usuario.type(campoCodigo, 'TKT-CMF-003')
    await usuario.click(screen.getByRole('button', { name: /buscar ticket/i }))

    expect(
      await screen.findByRole('heading', { name: 'Caribbean Music Fest 2026' }),
    ).toBeInTheDocument()

    await usuario.click(screen.getByRole('button', { name: /marcar como usado/i }))

    const alertaCancelado = await screen.findByRole('alert')
    expect(alertaCancelado).toHaveTextContent('Only PAID tickets can be marked as USED')
  })

  it('TEST-FE-STF-005: consulta de tickets pagados por evento muestra tabla con datos, permite cambiar a evento vacío (EstadoVacio), maneja 404 y abre ticket en validador', async () => {
    const usuario = userEvent.setup()

    const { router } = renderConProveedores({
      rutaInicial: '/staff/eventos/CMF-2026/tickets',
      tokenInicial: 'jwt-staff-token',
    })

    expect(
      await screen.findByRole('heading', { name: 'Tickets pagados' }),
    ).toBeInTheDocument()

    // Verifica que aparece el ticket pagado de CMF-2026 (TKT-CMF-001) y no el cancelado (TKT-CMF-003)
    const tabla = await screen.findByRole('table')
    expect(within(tabla).getByText('TKT-CMF-001')).toBeInTheDocument()
    expect(within(tabla).getByText('andrea@pulsepass.co')).toBeInTheDocument()
    expect(within(tabla).queryByText('TKT-CMF-003')).not.toBeInTheDocument()
    expect(screen.getByText('1 entrada pagada')).toBeInTheDocument()

    // Cambiar a TECH-2026 (sin tickets en estado PAID) mediante el selector rápido
    await usuario.selectOptions(
      screen.getByLabelText(/selector rápido/i),
      'TECH-2026',
    )

    expect(router.state.location.pathname).toBe('/staff/eventos/TECH-2026/tickets')
    expect(
      await screen.findByRole('heading', {
        name: 'Sin tickets pagados para este evento',
      }),
    ).toBeInTheDocument()

    // Consultar un código de evento inexistente manualmente (404)
    const campoEvento = screen.getByLabelText('Código del evento')
    await usuario.clear(campoEvento)
    await usuario.type(campoEvento, 'EVT-NO-EXISTE')
    await usuario.click(screen.getByRole('button', { name: /consultar evento/i }))

    expect(router.state.location.pathname).toBe('/staff/eventos/EVT-NO-EXISTE/tickets')
    const alerta404 = await screen.findByRole('alert')
    expect(alerta404).toHaveTextContent('Event not found: EVT-NO-EXISTE')

    // Volver a CMF-2026 y abrir el ticket en el validador
    const campoEventoActualizado = screen.getByLabelText('Código del evento')
    await usuario.clear(campoEventoActualizado)
    await usuario.type(campoEventoActualizado, 'CMF-2026')
    await usuario.click(screen.getByRole('button', { name: /consultar evento/i }))

    const tablaRegreso = await screen.findByRole('table')
    await usuario.click(
      within(tablaRegreso).getByRole('link', { name: /abrir en validador/i }),
    )

    expect(
      await screen.findByRole('heading', { name: 'Validación de ingreso' }),
    ).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/staff/validacion')
    expect(
      await screen.findByRole('heading', { name: 'Caribbean Music Fest 2026' }),
    ).toBeInTheDocument()
  })

  it('TEST-FE-STF-006: bloqueo de acceso a rol USER redirige a /403 en las rutas operativas de Staff', async () => {
    const vistaValidador = renderConProveedores({
      rutaInicial: '/staff/validacion',
      tokenInicial: 'jwt-user-token',
    })

    expect(await screen.findByText('403')).toBeInTheDocument()
    expect(vistaValidador.router.state.location.pathname).toBe('/403')
    vistaValidador.unmount()

    const vistaTicketsEvento = renderConProveedores({
      rutaInicial: '/staff/eventos/CMF-2026/tickets',
      tokenInicial: 'jwt-user-token',
    })

    expect(await screen.findByText('403')).toBeInTheDocument()
    expect(vistaTicketsEvento.router.state.location.pathname).toBe('/403')
  })
})
