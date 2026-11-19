import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http as mswHttp, HttpResponse } from 'msw'
import { beforeEach, describe, expect, it } from 'vitest'
import { ARTISTAS_DEMO, EVENTOS_DETALLE_DEMO } from '../../../test/mocks/handlers'
import { server } from '../../../test/mocks/server'
import { renderConProveedores } from '../../../test/utils'
import { obtenerUsuarioPorEmail } from '../api'
import { limpiarEventosCreadosEnSesion } from '../tipos'

describe('Panel de Administración ADMIN — Eventos, Lineup y Publicación (Etapa 8)', () => {
  beforeEach(() => {
    limpiarEventosCreadosEnSesion()
  })

  it('TEST-FE-ADM-001: validación en cliente con campos vacíos muestra errores por campo y no dispara POST /api/events', async () => {
    const usuario = userEvent.setup()
    let peticionesPost = 0

    server.use(
      mswHttp.post('/api/events', () => {
        peticionesPost += 1
        return new HttpResponse(null, { status: 201 })
      }),
    )

    renderConProveedores({
      rutaInicial: '/admin/eventos/nuevo',
      tokenInicial: 'jwt-admin-token',
    })

    expect(
      await screen.findByRole('heading', { name: 'Crear evento' }),
    ).toBeInTheDocument()

    await usuario.click(screen.getByRole('button', { name: /crear evento/i }))

    expect(
      await screen.findByText('El código del evento es obligatorio'),
    ).toBeInTheDocument()
    expect(
      screen.getByText('El nombre del evento es obligatorio'),
    ).toBeInTheDocument()
    expect(
      screen.getByText('La fecha del evento es obligatoria'),
    ).toBeInTheDocument()
    expect(screen.getByText('La sede es obligatoria')).toBeInTheDocument()
    expect(peticionesPost).toBe(0)
  })

  it('TEST-FE-ADM-002: creación exitosa de evento (201) normaliza eventDate (:00 sin Z), muestra aviso de éxito y navega a la gestión del evento', async () => {
    const usuario = userEvent.setup()
    let payloadRecibido: Record<string, unknown> = {}

    server.use(
      mswHttp.post('/api/events', async ({ request }) => {
        payloadRecibido = (await request.json()) as Record<string, unknown>
        return new HttpResponse(null, { status: 201 })
      }),
      mswHttp.get('/api/events/FEST-2026', () =>
        HttpResponse.json({
          id: 210,
          eventCode: 'FEST-2026',
          name: 'Caribe Indie Fest 2026',
          description: 'Festival independiente frente al mar.',
          category: 'MUSIC',
          status: 'DRAFT',
          eventDate: '2026-12-15T20:30:00',
          minimumAge: 18,
          venueCode: 'VEN-SMR-01',
          venueName: 'Marina Convention Center',
          artists: [],
        }),
      ),
    )

    const { router } = renderConProveedores({
      rutaInicial: '/admin/eventos/nuevo',
      tokenInicial: 'jwt-admin-token',
    })

    expect(
      await screen.findByRole('heading', { name: 'Crear evento' }),
    ).toBeInTheDocument()

    // Esperar a que las sedes activas se carguen en el Selector
    expect(
      await screen.findByRole('option', { name: /Marina Convention Center/i }),
    ).toBeInTheDocument()

    await usuario.type(screen.getByLabelText('Código del evento'), '  FEST-2026  ')
    await usuario.type(
      screen.getByLabelText('Nombre del evento'),
      'Caribe Indie Fest 2026',
    )
    await usuario.type(
      screen.getByLabelText('Descripción'),
      'Festival independiente frente al mar.',
    )
    await usuario.selectOptions(screen.getByLabelText('Categoría'), 'MUSIC')
    await usuario.clear(screen.getByLabelText('Edad mínima'))
    await usuario.type(screen.getByLabelText('Edad mínima'), '18')
    await usuario.type(
      screen.getByLabelText('Fecha y hora del evento'),
      '2026-12-15T20:30',
    )
    await usuario.selectOptions(screen.getByLabelText('Sede'), 'VEN-SMR-01')

    await usuario.click(screen.getByRole('button', { name: /crear evento/i }))

    const confirmacion = await screen.findByRole('status')
    expect(confirmacion).toHaveTextContent('Evento creado exitosamente')
    expect(confirmacion).toHaveTextContent('FEST-2026')

    // Verificar normalización de eventDate ("YYYY-MM-DDTHH:mm" -> "YYYY-MM-DDTHH:mm:00", sin Z)
    expect(payloadRecibido).toEqual({
      eventCode: 'FEST-2026',
      name: 'Caribe Indie Fest 2026',
      description: 'Festival independiente frente al mar.',
      category: 'MUSIC',
      eventDate: '2026-12-15T20:30:00',
      minimumAge: 18,
      venueCode: 'VEN-SMR-01',
    })
    expect(String(payloadRecibido.eventDate)).not.toContain('Z')

    // Seguir el enlace directo a la vista de gestión del evento creado
    const enlaceGestion = within(confirmacion).getByRole('link', {
      name: /gestionar evento FEST-2026/i,
    })
    await usuario.click(enlaceGestion)

    expect(router.state.location.pathname).toBe('/admin/eventos/FEST-2026')
    expect(
      await screen.findByRole('heading', { name: 'Caribe Indie Fest 2026' }),
    ).toBeInTheDocument()
    expect(screen.getAllByText('DRAFT').length).toBeGreaterThan(0)
  })

  it('TEST-FE-ADM-003: error 400 Bad Request con details mapea los mensajes a los campos correspondientes del formulario', async () => {
    const usuario = userEvent.setup()

    server.use(
      mswHttp.post('/api/events', () =>
        HttpResponse.json(
          {
            timestamp: '2026-11-19T00:00:00',
            status: 400,
            error: 'Bad Request',
            message: 'Validation failed',
            details: {
              eventDate: 'La fecha del evento debe ser futura',
              venueCode: 'La sede seleccionada no se encuentra activa',
            },
          },
          { status: 400 },
        ),
      ),
    )

    renderConProveedores({
      rutaInicial: '/admin/eventos/nuevo',
      tokenInicial: 'jwt-admin-token',
    })

    expect(
      await screen.findByRole('option', { name: /Marina Convention Center/i }),
    ).toBeInTheDocument()

    await usuario.type(screen.getByLabelText('Código del evento'), 'EVT-400')
    await usuario.type(screen.getByLabelText('Nombre del evento'), 'Evento con 400')
    await usuario.type(
      screen.getByLabelText('Fecha y hora del evento'),
      '2025-01-10T18:00',
    )
    await usuario.selectOptions(screen.getByLabelText('Sede'), 'VEN-SMR-01')

    await usuario.click(screen.getByRole('button', { name: /crear evento/i }))

    expect(
      await screen.findByText('La fecha del evento debe ser futura'),
    ).toBeInTheDocument()
    expect(
      screen.getByText('La sede seleccionada no se encuentra activa'),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Fecha y hora del evento')).toHaveAttribute(
      'aria-invalid',
      'true',
    )
    expect(screen.getByLabelText('Sede')).toHaveAttribute('aria-invalid', 'true')
  })

  it('TEST-FE-ADM-004: error 409 Conflict en creación (código duplicado) muestra literal el mensaje del backend en Aviso de error', async () => {
    const usuario = userEvent.setup()

    renderConProveedores({
      rutaInicial: '/admin/eventos/nuevo',
      tokenInicial: 'jwt-admin-token',
    })

    expect(
      await screen.findByRole('option', { name: /Marina Convention Center/i }),
    ).toBeInTheDocument()

    await usuario.type(screen.getByLabelText('Código del evento'), 'CMF-2026')
    await usuario.type(
      screen.getByLabelText('Nombre del evento'),
      'Caribbean Music Fest Duplicado',
    )
    await usuario.type(
      screen.getByLabelText('Fecha y hora del evento'),
      '2026-12-12T20:00',
    )
    await usuario.selectOptions(screen.getByLabelText('Sede'), 'VEN-SMR-01')

    await usuario.click(screen.getByRole('button', { name: /crear evento/i }))

    const alerta = await screen.findByRole('alert')
    expect(alerta).toHaveTextContent('Event code already exists: CMF-2026')
  })

  it('TEST-FE-ADM-005: asignación exitosa de artista (200) refresca el lineup y error 409 (artista ya asignado) muestra literal el mensaje del backend', async () => {
    const usuario = userEvent.setup()
    let artistasActuales = [...EVENTOS_DETALLE_DEMO['DRAFT-2026']!.artists]

    server.use(
      mswHttp.get('/api/events/DRAFT-2026', () =>
        HttpResponse.json({
          ...EVENTOS_DETALLE_DEMO['DRAFT-2026']!,
          artists: artistasActuales,
        }),
      ),
      mswHttp.post('/api/events/DRAFT-2026/artists/:artistId', ({ params }) => {
        const id = Number(params.artistId)
        if (artistasActuales.some((a) => a.id === id)) {
          return HttpResponse.json(
            {
              timestamp: '2026-11-19T00:00:00',
              status: 409,
              error: 'Conflict',
              message: 'Artist is already assigned to this event',
              details: {},
            },
            { status: 409 },
          )
        }
        const nuevo = ARTISTAS_DEMO.find((a) => a.id === id)
        if (nuevo) {
          artistasActuales = [...artistasActuales, nuevo]
        }
        return new HttpResponse(null, { status: 200 })
      }),
    )

    renderConProveedores({
      rutaInicial: '/admin/eventos/DRAFT-2026',
      tokenInicial: 'jwt-admin-token',
    })

    expect(
      await screen.findByRole('heading', { name: 'Festival Borrador 2026' }),
    ).toBeInTheDocument()
    expect(screen.getByText('1 en cartel')).toBeInTheDocument()

    // Esperar a que carguen las opciones de artistas activos
    expect(
      await screen.findByRole('option', { name: 'Neon Waves' }),
    ).toBeInTheDocument()

    // Asignar Neon Waves (ID 2) -> 200 OK
    await usuario.selectOptions(screen.getByLabelText('Artista'), '2')
    await usuario.click(screen.getByRole('button', { name: /asignar artista/i }))

    const confirmacion = await screen.findByRole('status')
    expect(confirmacion).toHaveTextContent(
      'Artista Neon Waves asignado al evento DRAFT-2026 exitosamente.',
    )
    expect(await screen.findByText('2 en cartel')).toBeInTheDocument()

    // Intentar asignar de nuevo Solar Beat (ID 1, ya asignado) -> 409 Conflict
    await usuario.selectOptions(screen.getByLabelText('Artista'), '1')
    await usuario.click(screen.getByRole('button', { name: /asignar artista/i }))

    const alerta409 = await screen.findByRole('alert')
    expect(alerta409).toHaveTextContent('Artist is already assigned to this event')
  })

  it('TEST-FE-ADM-006: publicación exitosa (DRAFT -> PUBLISHED) actualiza el estado y error 409 (sin artistas) muestra literal el mensaje del backend', async () => {
    const usuario = userEvent.setup()
    let publicadoEnServidor = false

    server.use(
      mswHttp.get('/api/events/DRAFT-2026', () =>
        HttpResponse.json({
          ...EVENTOS_DETALLE_DEMO['DRAFT-2026']!,
          status: publicadoEnServidor ? 'PUBLISHED' : 'DRAFT',
        }),
      ),
      mswHttp.patch('/api/events/DRAFT-2026/publish', () => {
        publicadoEnServidor = true
        return new HttpResponse(null, { status: 200 })
      }),
      mswHttp.get('/api/events/SIN-ARTISTAS-2026', () =>
        HttpResponse.json({
          ...EVENTOS_DETALLE_DEMO['DRAFT-2026']!,
          eventCode: 'SIN-ARTISTAS-2026',
          name: 'Evento Sin Lineup 2026',
          status: 'DRAFT',
          artists: [],
        }),
      ),
      mswHttp.patch('/api/events/SIN-ARTISTAS-2026/publish', () =>
        HttpResponse.json(
          {
            timestamp: '2026-11-19T00:00:00',
            status: 409,
            error: 'Conflict',
            message: 'Event must have at least one artist before publishing',
            details: {},
          },
          { status: 409 },
        ),
      ),
    )

    renderConProveedores({
      rutaInicial: '/admin/eventos/DRAFT-2026',
      tokenInicial: 'jwt-admin-token',
    })

    expect(
      await screen.findByRole('heading', { name: 'Festival Borrador 2026' }),
    ).toBeInTheDocument()
    expect(screen.getAllByText('DRAFT').length).toBeGreaterThan(0)

    // Publicar DRAFT-2026 -> 200 OK
    await usuario.click(screen.getByRole('button', { name: /publicar evento/i }))

    const confirmacion = await screen.findByRole('status')
    expect(confirmacion).toHaveTextContent(
      'El evento DRAFT-2026 fue publicado (PUBLISHED) exitosamente.',
    )
    expect(screen.getAllByText('PUBLISHED').length).toBeGreaterThan(0)

    // Consultar evento SIN-ARTISTAS-2026 desde el buscador de la vista y probar 409 al publicar
    const campoBusqueda = screen.getByLabelText('Código del evento')
    await usuario.clear(campoBusqueda)
    await usuario.type(campoBusqueda, 'SIN-ARTISTAS-2026')
    await usuario.click(screen.getByRole('button', { name: /consultar evento/i }))

    expect(
      await screen.findByRole('heading', { name: 'Evento Sin Lineup 2026' }),
    ).toBeInTheDocument()
    expect(
      screen.getByText('Este evento aún no tiene artistas asignados.'),
    ).toBeInTheDocument()

    await usuario.click(screen.getByRole('button', { name: /publicar evento/i }))

    const alerta = await screen.findByRole('alert')
    expect(alerta).toHaveTextContent(
      'Event must have at least one artist before publishing',
    )
  })

  it('TEST-FE-ADM-007: consola /admin/eventos lista eventos publicados, permite buscar por código y bloquea acceso a roles USER y STAFF (/403)', async () => {
    const usuario = userEvent.setup()

    // Verificar cliente obtenerUsuarioPorEmail (GET /api/users/by-email?email=)
    const perfilAdmin = await obtenerUsuarioPorEmail('admin@pulsepass.co')
    expect(perfilAdmin.username).toBe('admin_pulse')
    expect(perfilAdmin.active).toBe(true)

    // 1. Acceso ADMIN a /admin/eventos y búsqueda por código hacia /admin/eventos/DRAFT-2026
    const vistaAdmin = renderConProveedores({
      rutaInicial: '/admin/eventos',
      tokenInicial: 'jwt-admin-token',
    })

    expect(
      await screen.findByRole('heading', { name: 'Administración de eventos' }),
    ).toBeInTheDocument()

    const tabla = await screen.findByRole('table')
    expect(within(tabla).getByText('Caribbean Music Fest 2026')).toBeInTheDocument()

    await usuario.type(screen.getByLabelText('Código del evento'), 'DRAFT-2026')
    await usuario.click(screen.getByRole('button', { name: /consultar evento/i }))

    expect(vistaAdmin.router.state.location.pathname).toBe(
      '/admin/eventos/DRAFT-2026',
    )
    expect(
      await screen.findByRole('heading', { name: 'Festival Borrador 2026' }),
    ).toBeInTheDocument()
    vistaAdmin.unmount()

    // 2. Bloqueo de rol USER -> /403
    const vistaUser = renderConProveedores({
      rutaInicial: '/admin/eventos',
      tokenInicial: 'jwt-user-token',
    })
    expect(await screen.findByText('403')).toBeInTheDocument()
    expect(vistaUser.router.state.location.pathname).toBe('/403')
    vistaUser.unmount()

    // 3. Bloqueo de rol STAFF -> /403 en /admin/eventos/nuevo y /admin/eventos/CMF-2026
    const vistaStaffCrear = renderConProveedores({
      rutaInicial: '/admin/eventos/nuevo',
      tokenInicial: 'jwt-staff-token',
    })
    expect(await screen.findByText('403')).toBeInTheDocument()
    expect(vistaStaffCrear.router.state.location.pathname).toBe('/403')
    vistaStaffCrear.unmount()

    const vistaStaffGestion = renderConProveedores({
      rutaInicial: '/admin/eventos/CMF-2026',
      tokenInicial: 'jwt-staff-token',
    })
    expect(await screen.findByText('403')).toBeInTheDocument()
    expect(vistaStaffGestion.router.state.location.pathname).toBe('/403')
  })
})
