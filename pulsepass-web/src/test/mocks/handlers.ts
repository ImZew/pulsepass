import { http, HttpResponse, type RequestHandler } from 'msw'
import type { ArtistResponse } from '../../funcionalidades/artistas/tipos'
import type { AuthenticatedUserResponse } from '../../funcionalidades/auth/tipos'
import type {
  EventResponse,
  EventSummaryResponse,
} from '../../funcionalidades/eventos/tipos'
import type { VenueResponse } from '../../funcionalidades/sedes/tipos'

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
]
