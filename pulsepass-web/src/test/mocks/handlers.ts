import { http, HttpResponse, type RequestHandler } from 'msw'
import type { ArtistResponse } from '../../funcionalidades/artistas/tipos'
import type { AuthenticatedUserResponse } from '../../funcionalidades/auth/tipos'
import type {
  EventResponse,
  EventSummaryResponse,
} from '../../funcionalidades/eventos/tipos'
import type { VenueResponse } from '../../funcionalidades/sedes/tipos'
import type { TicketResponse } from '../../funcionalidades/tickets/tipos'
import type { UserResponse } from '../../funcionalidades/usuarios/tipos'

export const USUARIO_DEMO_USER: AuthenticatedUserResponse = {
  id: 1,
  username: 'andrea',
  email: 'andrea@pulsepass.co',
  roles: ['USER'],
}

export const USUARIO_DEMO_STAFF: AuthenticatedUserResponse = {
  id: 2,
  username: 'carlos_staff',
  email: 'staff@pulsepass.co',
  roles: ['STAFF'],
}

export const USUARIO_DEMO_ADMIN: AuthenticatedUserResponse = {
  id: 3,
  username: 'admin_pulse',
  email: 'admin@pulsepass.co',
  roles: ['ADMIN'],
}

export const ARTISTAS_DEMO: ArtistResponse[] = [
  { id: 1, stageName: 'Solar Beat', active: true },
  { id: 2, stageName: 'Neon Waves', active: true },
  { id: 3, stageName: 'Caribbean Sound', active: true },
]

export const SEDES_DEMO: VenueResponse[] = [
  {
    code: 'VEN-SMR-01',
    name: 'Marina Convention Center',
    city: 'Santa Marta',
    capacity: 3000,
    active: true,
  },
  {
    code: 'VEN-BOG-01',
    name: 'Coliseo Capital',
    city: 'Bogotá',
    capacity: 8500,
    active: true,
  },
]

export const EVENTOS_RESUMEN_DEMO: EventSummaryResponse[] = [
  {
    eventCode: 'CMF-2026',
    name: 'Caribbean Music Fest 2026',
    status: 'PUBLISHED',
    eventDate: '2026-12-12T20:00:00',
    venueName: 'Marina Convention Center',
    category: 'MUSIC',
    city: 'Santa Marta',
  },
  {
    eventCode: 'TECH-2026',
    name: 'Caribe Tech Summit 2026',
    status: 'PUBLISHED',
    eventDate: '2026-11-28T09:00:00',
    venueName: 'Coliseo Capital',
    category: 'TECHNOLOGY',
    city: 'Bogotá',
  },
]

export const EVENTOS_DETALLE_DEMO: Record<string, EventResponse> = {
  'CMF-2026': {
    id: 101,
    eventCode: 'CMF-2026',
    name: 'Caribbean Music Fest 2026',
    description: 'El festival de música electrónica y caribeña más grande de la costa.',
    category: 'MUSIC',
    status: 'PUBLISHED',
    eventDate: '2026-12-12T20:00:00',
    minimumAge: 18,
    venueCode: 'VEN-SMR-01',
    venueName: 'Marina Convention Center',
    artists: [
      { id: 1, stageName: 'Solar Beat', active: true },
      { id: 2, stageName: 'Neon Waves', active: true },
    ],
  },
  'TECH-2026': {
    id: 102,
    eventCode: 'TECH-2026',
    name: 'Caribe Tech Summit 2026',
    description: 'Cumbre de arquitectura de software, inteligencia artificial y web.',
    category: 'TECHNOLOGY',
    status: 'PUBLISHED',
    eventDate: '2026-11-28T09:00:00',
    minimumAge: 0,
    venueCode: 'VEN-BOG-01',
    venueName: 'Coliseo Capital',
    artists: [{ id: 3, stageName: 'Caribbean Sound', active: true }],
  },
  'SOLD-2026': {
    id: 103,
    eventCode: 'SOLD-2026',
    name: 'Concierto Agotado 2026',
    description: 'Evento con aforo completo.',
    category: 'MUSIC',
    status: 'SOLD_OUT',
    eventDate: '2026-12-20T21:00:00',
    minimumAge: 18,
    venueCode: 'VEN-SMR-01',
    venueName: 'Marina Convention Center',
    artists: [{ id: 1, stageName: 'Solar Beat', active: true }],
  },
}

export const USUARIOS_PERFIL_DEMO: Record<string, UserResponse> = {
  andrea: {
    username: 'andrea',
    email: 'andrea@pulsepass.co',
    active: true,
  },
  carlos_staff: {
    username: 'carlos_staff',
    email: 'staff@pulsepass.co',
    active: true,
  },
  admin_pulse: {
    username: 'admin_pulse',
    email: 'admin@pulsepass.co',
    active: true,
  },
}

export const TICKETS_DEMO: TicketResponse[] = [
  {
    id: 505,
    ticketCode: 'TKT-CMF-001',
    type: 'VIP',
    price: 350000,
    status: 'PAID',
    purchaseDate: '2026-11-18T14:30:00',
    userEmail: 'andrea@pulsepass.co',
    eventCode: 'CMF-2026',
    eventName: 'Caribbean Music Fest 2026',
  },
  {
    id: 502,
    ticketCode: 'TKT-TECH-002',
    type: 'GENERAL',
    price: 120000,
    status: 'USED',
    purchaseDate: '2026-11-10T09:15:00',
    userEmail: 'andrea@pulsepass.co',
    eventCode: 'TECH-2026',
    eventName: 'Caribe Tech Summit 2026',
  },
  {
    id: 501,
    ticketCode: 'TKT-CMF-003',
    type: 'STUDENT',
    price: 80000,
    status: 'CANCELLED',
    purchaseDate: '2026-11-05T18:00:00',
    userEmail: 'andrea@pulsepass.co',
    eventCode: 'CMF-2026',
    eventName: 'Caribbean Music Fest 2026',
  },
]

export const handlers: RequestHandler[] = [
  // —— Auth ——————————————————————————————————————————————————————
  http.post('/api/auth/login', async ({ request }) => {
    const body = (await request.json()) as { identifier?: string; password?: string }
    if (body.identifier === 'invalido' || body.password === 'incorrecta') {
      return HttpResponse.json(
        {
          timestamp: '2026-11-19T00:00:00',
          status: 401,
          error: 'Unauthorized',
          message: 'Autenticacion requerida o credenciales invalidas',
          details: {},
        },
        { status: 401 },
      )
    }

    const token =
      body.identifier === 'admin_pulse'
        ? 'jwt-admin-token'
        : body.identifier === 'carlos_staff'
          ? 'jwt-staff-token'
          : 'jwt-user-token'

    return HttpResponse.json({
      accessToken: token,
      tokenType: 'Bearer',
      expiresIn: 900,
    })
  }),

  http.get('/api/auth/me', ({ request }) => {
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json(
        {
          timestamp: '2026-11-19T00:00:00',
          status: 401,
          error: 'Unauthorized',
          message: 'Autenticacion requerida o credenciales invalidas',
          details: {},
        },
        { status: 401 },
      )
    }

    const token = authHeader.slice('Bearer '.length).trim()
    if (token === 'token-invalido-servidor') {
      return HttpResponse.json(
        {
          timestamp: '2026-11-19T00:00:00',
          status: 401,
          error: 'Unauthorized',
          message: 'Autenticacion requerida o credenciales invalidas',
          details: {},
        },
        { status: 401 },
      )
    }

    if (token === 'jwt-admin-token') {
      return HttpResponse.json(USUARIO_DEMO_ADMIN)
    }
    if (token === 'jwt-staff-token') {
      return HttpResponse.json(USUARIO_DEMO_STAFF)
    }
    return HttpResponse.json(USUARIO_DEMO_USER)
  }),

  http.post('/api/users', async ({ request }) => {
    const body = (await request.json()) as { username?: string; email?: string }
    if (body.username === 'duplicado' || body.email === 'duplicado@pulsepass.co') {
      return HttpResponse.json(
        {
          timestamp: '2026-11-19T00:00:00',
          status: 409,
          error: 'Conflict',
          message: 'Username or email already exists',
          details: {},
        },
        { status: 409 },
      )
    }
    return new HttpResponse(null, { status: 201 })
  }),

  // —— Eventos ———————————————————————————————————————————————————
  http.get('/api/events/published', () => {
    return HttpResponse.json(EVENTOS_RESUMEN_DEMO)
  }),

  http.get('/api/events/by-artist', ({ request }) => {
    const url = new URL(request.url)
    const stageName = url.searchParams.get('stageName') ?? ''
    if (stageName.toLowerCase() === 'solar beat') {
      return HttpResponse.json([EVENTOS_RESUMEN_DEMO[0]!])
    }
    if (stageName.toLowerCase() === 'caribbean sound') {
      return HttpResponse.json([EVENTOS_RESUMEN_DEMO[1]!])
    }
    return HttpResponse.json([])
  }),

  http.get('/api/events/:eventCode', ({ params }) => {
    const code = String(params.eventCode ?? '')
    const detalle = EVENTOS_DETALLE_DEMO[code]
    if (!detalle) {
      return HttpResponse.json(
        {
          timestamp: '2026-11-19T00:00:00',
          status: 404,
          error: 'Not Found',
          message: `Event not found: ${code}`,
          details: {},
        },
        { status: 404 },
      )
    }
    return HttpResponse.json(detalle)
  }),

  // —— Artistas ——————————————————————————————————————————————————
  http.get('/api/artists/active', () => {
    return HttpResponse.json(ARTISTAS_DEMO)
  }),

  http.get('/api/artists/by-stage-name', ({ request }) => {
    const url = new URL(request.url)
    const stageName = (url.searchParams.get('stageName') ?? '').toLowerCase()
    const encontrado = ARTISTAS_DEMO.find((a) => a.stageName.toLowerCase() === stageName)
    if (!encontrado) {
      return HttpResponse.json(
        {
          timestamp: '2026-11-19T00:00:00',
          status: 404,
          error: 'Not Found',
          message: 'Artist not found',
          details: {},
        },
        { status: 404 },
      )
    }
    return HttpResponse.json(encontrado)
  }),

  http.get('/api/artists/:id', ({ params }) => {
    const id = Number(params.id)
    const encontrado = ARTISTAS_DEMO.find((a) => a.id === id)
    if (!encontrado) {
      return HttpResponse.json(
        {
          timestamp: '2026-11-19T00:00:00',
          status: 404,
          error: 'Not Found',
          message: `Artist not found: ${String(params.id)}`,
          details: {},
        },
        { status: 404 },
      )
    }
    return HttpResponse.json(encontrado)
  }),

  // —— Sedes —————————————————————————————————————————————————————
  http.get('/api/venues/active', () => {
    return HttpResponse.json(SEDES_DEMO)
  }),

  http.get('/api/venues/:code', ({ params }) => {
    const code = String(params.code ?? '')
    const encontrada = SEDES_DEMO.find((s) => s.code === code)
    if (!encontrada) {
      return HttpResponse.json(
        {
          timestamp: '2026-11-19T00:00:00',
          status: 404,
          error: 'Not Found',
          message: `Venue not found: ${code}`,
          details: {},
        },
        { status: 404 },
      )
    }
    return HttpResponse.json(encontrada)
  }),

  // —— Usuarios (C-05: GET /api/users/{username}) ————————————————
  http.get('/api/users/:username', ({ params }) => {
    const username = String(params.username ?? '')
    const perfil = USUARIOS_PERFIL_DEMO[username]
    if (!perfil) {
      return HttpResponse.json(
        {
          timestamp: '2026-11-19T00:00:00',
          status: 404,
          error: 'Not Found',
          message: `User not found: ${username}`,
          details: {},
        },
        { status: 404 },
      )
    }
    return HttpResponse.json(perfil)
  }),

  // —— Tickets ———————————————————————————————————————————————————
  http.post('/api/tickets', async ({ request }) => {
    const body = (await request.json()) as {
      userEmail?: string
      eventCode?: string
      type?: string
    }
    if (body.eventCode === 'SOLD-2026') {
      return HttpResponse.json(
        {
          timestamp: '2026-11-19T00:00:00',
          status: 409,
          error: 'Conflict',
          message: 'No tickets available for this event',
          details: {},
        },
        { status: 409 },
      )
    }
    return new HttpResponse(null, { status: 201 })
  }),

  http.get('/api/tickets/by-user', ({ request }) => {
    const url = new URL(request.url)
    const email = url.searchParams.get('email') ?? ''
    const filtrados = TICKETS_DEMO.filter((t) => t.userEmail === email)
    return HttpResponse.json(filtrados)
  }),

  http.get('/api/tickets/:ticketCode', ({ params }) => {
    const code = String(params.ticketCode ?? '')
    if (code === 'TKT-AJENO-999') {
      return HttpResponse.json(
        {
          timestamp: '2026-11-19T00:00:00',
          status: 403,
          error: 'Forbidden',
          message: 'Access denied to this ticket',
          details: {},
        },
        { status: 403 },
      )
    }

    const encontrado = TICKETS_DEMO.find((t) => t.ticketCode === code)
    if (!encontrado) {
      return HttpResponse.json(
        {
          timestamp: '2026-11-19T00:00:00',
          status: 404,
          error: 'Not Found',
          message: `Ticket not found: ${code}`,
          details: {},
        },
        { status: 404 },
      )
    }
    return HttpResponse.json(encontrado)
  }),

  http.patch('/api/tickets/:ticketCode/cancel', ({ params }) => {
    const code = String(params.ticketCode ?? '')
    const encontrado = TICKETS_DEMO.find((t) => t.ticketCode === code)
    if (!encontrado) {
      return HttpResponse.json(
        {
          timestamp: '2026-11-19T00:00:00',
          status: 404,
          error: 'Not Found',
          message: `Ticket not found: ${code}`,
          details: {},
        },
        { status: 404 },
      )
    }

    if (encontrado.status === 'USED') {
      return HttpResponse.json(
        {
          timestamp: '2026-11-19T00:00:00',
          status: 409,
          error: 'Conflict',
          message: 'Used tickets cannot be cancelled',
          details: {},
        },
        { status: 409 },
      )
    }

    if (encontrado.status === 'CANCELLED') {
      return HttpResponse.json(
        {
          timestamp: '2026-11-19T00:00:00',
          status: 409,
          error: 'Conflict',
          message: 'Ticket is already cancelled',
          details: {},
        },
        { status: 409 },
      )
    }

    return new HttpResponse(null, { status: 200 })
  }),
]
