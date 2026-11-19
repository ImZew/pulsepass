import { http, HttpResponse, type RequestHandler } from 'msw'
import type { AuthenticatedUserResponse } from '../../funcionalidades/auth/tipos'

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

export const handlers: RequestHandler[] = [
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
]
