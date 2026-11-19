import { http as mswHttp, HttpResponse } from 'msw'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { z } from 'zod'
import { server } from '../test/mocks/server'
import { guardarToken } from './almacenSesion'
import {
  ApiError,
  http,
  MENSAJE_ERROR_GENERICO,
  MENSAJE_ERROR_RED,
  registrarOnUnauthorized,
} from './http'
import { debeReintentar } from './queryClient'

const EsquemaPrueba = z.object({ eventCode: z.string(), name: z.string() })

async function capturarError(promesa: Promise<unknown>): Promise<ApiError> {
  try {
    await promesa
  } catch (error) {
    if (error instanceof ApiError) return error
    throw error
  }
  throw new Error('Se esperaba un ApiError')
}

describe('lib/http', () => {
  let anular: (() => void) | undefined

  afterEach(() => {
    anular?.()
    anular = undefined
  })

  it('TEST-FE-LIB-001: añade Authorization Bearer cuando hay sesión (y no lo envía sin sesión)', async () => {
    const cabeceras: (string | null)[] = []
    server.use(
      mswHttp.get('/api/auth/me', ({ request }) => {
        cabeceras.push(request.headers.get('Authorization'))
        return HttpResponse.json({ eventCode: 'CMF-2026', name: 'Fest' })
      }),
    )

    await http('/auth/me', { schema: EsquemaPrueba })
    guardarToken('token-de-prueba', 900)
    await http('/auth/me', { schema: EsquemaPrueba })

    expect(cabeceras).toEqual([null, 'Bearer token-de-prueba'])
  })

  it('TEST-FE-LIB-001: no envía un token expirado y nunca lo pone en la URL', async () => {
    const urls: string[] = []
    let cabecera: string | null = 'sin-leer'
    server.use(
      mswHttp.get('/api/events/published', ({ request }) => {
        urls.push(request.url)
        cabecera = request.headers.get('Authorization')
        return HttpResponse.json([])
      }),
    )
    guardarToken('token-vencido', -1)

    await http('/events/published')

    expect(cabecera).toBeNull()
    expect(urls[0]).not.toContain('token')
  })

  it('TEST-FE-LIB-002: ErrorResponse válido → ApiError con status, message y details', async () => {
    server.use(
      mswHttp.post('/api/events', () =>
        HttpResponse.json(
          {
            timestamp: '2026-11-18T13:00:00.123456789',
            status: 400,
            error: 'Bad Request',
            message: 'Validation failed',
            details: { eventCode: 'El código del evento es obligatorio' },
          },
          { status: 400 },
        ),
      ),
      mswHttp.post('/api/tickets', () =>
        HttpResponse.json(
          {
            timestamp: '2026-11-18T13:00:00',
            status: 409,
            error: 'Conflict',
            message: 'User does not meet the minimum age',
            details: {},
          },
          { status: 409 },
        ),
      ),
    )

    const error400 = await capturarError(http('/events', { method: 'POST', body: {} }))
    expect(error400.status).toBe(400)
    expect(error400.message).toBe('Validation failed')
    expect(error400.details).toEqual({ eventCode: 'El código del evento es obligatorio' })

    const error409 = await capturarError(http('/tickets', { method: 'POST', body: {} }))
    expect(error409).toBeInstanceOf(ApiError)
    expect(error409.status).toBe(409)
    expect(error409.message).toBe('User does not meet the minimum age')
    expect(error409.details).toEqual({})
  })

  it('TEST-FE-LIB-003: cuerpo de error inválido → ApiError genérico', async () => {
    server.use(
      mswHttp.get('/api/venues/active', () => new HttpResponse('<html>Bad Gateway</html>', { status: 502 })),
      mswHttp.get('/api/artists/active', () => HttpResponse.json({ foo: 'bar' }, { status: 500 })),
      mswHttp.get('/api/artists/1', () => new HttpResponse(null, { status: 404 })),
    )

    const noJson = await capturarError(http('/venues/active'))
    expect(noJson.status).toBe(502)
    expect(noJson.message).toBe(MENSAJE_ERROR_GENERICO)
    expect(noJson.details).toEqual({})

    const fueraDeContrato = await capturarError(http('/artists/active'))
    expect(fueraDeContrato.status).toBe(500)
    expect(fueraDeContrato.message).toBe(MENSAJE_ERROR_GENERICO)

    const vacio = await capturarError(http('/artists/1'))
    expect(vacio.status).toBe(404)
    expect(vacio.message).toBe(MENSAJE_ERROR_GENERICO)
  })

  it('TEST-FE-LIB-004: 401 → dispara el cierre de sesión (onUnauthorized)', async () => {
    const cerrarSesion = vi.fn()
    anular = registrarOnUnauthorized(cerrarSesion)
    server.use(
      mswHttp.get('/api/tickets/by-user', () =>
        HttpResponse.json(
          {
            timestamp: '2026-11-18T13:00:00',
            status: 401,
            error: 'Unauthorized',
            message: 'Autenticacion requerida o credenciales invalidas',
            details: {},
          },
          { status: 401 },
        ),
      ),
    )
    guardarToken('token-expirado-en-servidor', 900)

    const error = await capturarError(http('/tickets/by-user?email=andrea%40pulsepass.co'))

    expect(error.status).toBe(401)
    expect(cerrarSesion).toHaveBeenCalledTimes(1)
  })

  it('TEST-FE-LIB-004: 401 en POST /api/auth/login NO dispara el cierre de sesión', async () => {
    const cerrarSesion = vi.fn()
    anular = registrarOnUnauthorized(cerrarSesion)
    server.use(
      mswHttp.post('/api/auth/login', () =>
        HttpResponse.json(
          {
            timestamp: '2026-11-18T13:00:00',
            status: 401,
            error: 'Unauthorized',
            message: 'Autenticacion requerida o credenciales invalidas',
            details: {},
          },
          { status: 401 },
        ),
      ),
    )

    const error = await capturarError(
      http('/auth/login', { method: 'POST', body: { identifier: 'x', password: 'y' } }),
    )

    expect(error.status).toBe(401)
    expect(cerrarSesion).not.toHaveBeenCalled()
  })

  it('respuesta 201/200 con cuerpo vacío → undefined; con esquema opcional también valida', async () => {
    server.use(
      mswHttp.post('/api/tickets', () => new HttpResponse(null, { status: 201 })),
      mswHttp.patch('/api/events/CMF-2026/publish', () => new HttpResponse('', { status: 200 })),
    )

    await expect(http('/tickets', { method: 'POST', body: {} })).resolves.toBeUndefined()
    await expect(
      http('/events/CMF-2026/publish', { method: 'PATCH', schema: EsquemaPrueba.optional() }),
    ).resolves.toBeUndefined()
  })

  it('respuesta JSON con esquema → valida y devuelve el dato tipado; envía JSON con Content-Type', async () => {
    let contentType: string | null = null
    let cuerpoRecibido: unknown = null
    server.use(
      mswHttp.post('/api/tickets', async ({ request }) => {
        contentType = request.headers.get('Content-Type')
        cuerpoRecibido = await request.json()
        return HttpResponse.json({ eventCode: 'CMF-2026', name: 'Fest', extra: true }, { status: 201 })
      }),
    )

    const dato = await http('/tickets', {
      method: 'POST',
      body: { eventCode: 'CMF-2026' },
      schema: EsquemaPrueba,
    })

    expect(dato).toEqual({ eventCode: 'CMF-2026', name: 'Fest' })
    expect(contentType).toBe('application/json')
    expect(cuerpoRecibido).toEqual({ eventCode: 'CMF-2026' })
  })

  it('fallo de red → ApiError(0, "No pudimos conectar con el servidor.")', async () => {
    server.use(mswHttp.get('/api/events/published', () => HttpResponse.error()))

    const error = await capturarError(http('/events/published'))

    expect(error.status).toBe(0)
    expect(error.message).toBe(MENSAJE_ERROR_RED)
  })
})

describe('lib/queryClient — política de reintentos (§14.3)', () => {
  it('no reintenta 4xx', () => {
    for (const status of [400, 401, 403, 404, 409]) {
      expect(debeReintentar(0, new ApiError(status, 'x'))).toBe(false)
    }
  })

  it('reintenta una sola vez errores de red y 5xx', () => {
    expect(debeReintentar(0, new ApiError(0, MENSAJE_ERROR_RED))).toBe(true)
    expect(debeReintentar(0, new ApiError(503, 'x'))).toBe(true)
    expect(debeReintentar(1, new ApiError(503, 'x'))).toBe(false)
  })

  it('no reintenta errores que no son ApiError (contrato zod roto)', () => {
    expect(debeReintentar(0, new Error('zod'))).toBe(false)
  })
})
