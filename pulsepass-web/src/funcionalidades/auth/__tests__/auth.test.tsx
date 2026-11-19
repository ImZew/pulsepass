import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http as mswHttp, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { leerTokenVigente } from '../../../lib/almacenSesion'
import { server } from '../../../test/mocks/server'
import { renderConProveedores } from '../../../test/utils'

describe('Autenticación, Registro, Guardas y Sesión (Etapa 4)', () => {
  it('TEST-FE-AUTH-001: login válido → sesión autenticada y redirección a la ruta origen (state.desde)', async () => {
    const usuario = userEvent.setup()
    const { router } = renderConProveedores({ rutaInicial: '/mis-tickets' })

    // RutaProtegida redirige inicialmente a /login con state.desde = '/mis-tickets'
    expect(await screen.findByRole('heading', { name: 'Inicia sesión' })).toBeInTheDocument()

    await usuario.type(screen.getByLabelText('Usuario o correo'), 'andrea')
    await usuario.type(screen.getByLabelText('Contraseña'), 'ClaveSegura2026!')
    await usuario.click(screen.getByRole('button', { name: 'Ingresar' }))

    expect(await screen.findByRole('heading', { name: 'Mis tickets' })).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/mis-tickets')
    expect(leerTokenVigente()?.token).toBe('jwt-user-token')
  })

  it('TEST-FE-AUTH-002: login 401 → muestra "Credenciales inválidas" en role="alert"', async () => {
    const usuario = userEvent.setup()
    renderConProveedores({ rutaInicial: '/login' })

    expect(await screen.findByRole('heading', { name: 'Inicia sesión' })).toBeInTheDocument()
    await usuario.type(screen.getByLabelText('Usuario o correo'), 'invalido')
    await usuario.type(screen.getByLabelText('Contraseña'), 'incorrecta')
    await usuario.click(screen.getByRole('button', { name: 'Ingresar' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Credenciales inválidas')
    expect(leerTokenVigente()).toBeNull()
  })

  it('TEST-FE-AUTH-003: RutaProtegida con usuario anónimo redirige a /login conservando state.desde; formulario vacío hace 0 peticiones', async () => {
    const usuario = userEvent.setup()
    let peticionesLogin = 0
    server.use(
      mswHttp.post('/api/auth/login', () => {
        peticionesLogin += 1
        return HttpResponse.json({ accessToken: 'x', tokenType: 'Bearer', expiresIn: 900 })
      }),
    )

    const { router } = renderConProveedores({ rutaInicial: '/cuenta' })

    expect(await screen.findByRole('heading', { name: 'Inicia sesión' })).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/login')
    expect(router.state.location.state).toMatchObject({ desde: '/cuenta' })

    await usuario.click(screen.getByRole('button', { name: 'Ingresar' }))
    expect(await screen.findByText('El usuario o correo es obligatorio')).toBeInTheDocument()
    expect(screen.getByText('La contraseña es obligatoria')).toBeInTheDocument()
    expect(peticionesLogin).toBe(0)
  })

  it('TEST-FE-AUTH-004: RutaPorRol redirige USER en /admin/eventos a /403 y permite ADMIN', async () => {
    const vistaUser = renderConProveedores({
      rutaInicial: '/admin/eventos',
      tokenInicial: 'jwt-user-token',
    })

    expect(
      await screen.findByRole('heading', {
        name: 'No tienes permisos para acceder a esta sección.',
      }),
    ).toBeInTheDocument()
    expect(vistaUser.router.state.location.pathname).toBe('/403')
    vistaUser.unmount()

    const vistaAdmin = renderConProveedores({
      rutaInicial: '/admin/eventos',
      tokenInicial: 'jwt-admin-token',
    })

    expect(
      await screen.findByRole('heading', { name: 'Administración de eventos' }),
    ).toBeInTheDocument()
    expect(vistaAdmin.router.state.location.pathname).toBe('/admin/eventos')
  })

  it('TEST-FE-AUTH-005: cerrar sesión limpia token, limpia caché de QueryClient y redirige a /login', async () => {
    const usuario = userEvent.setup()
    const { router, queryClient } = renderConProveedores({
      rutaInicial: '/cuenta',
      tokenInicial: 'jwt-user-token',
    })
    queryClient.setQueryData(['tickets', 'usuario', 'andrea@pulsepass.co'], [{ id: 1 }])

    expect(await screen.findByRole('heading', { name: 'Mi cuenta' })).toBeInTheDocument()
    const botonesCerrar = screen.getAllByRole('button', { name: 'Cerrar sesión' })
    await usuario.click(botonesCerrar[0]!)

    expect(await screen.findByRole('heading', { name: 'Inicia sesión' })).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/login')
    expect(leerTokenVigente()).toBeNull()
    expect(queryClient.getQueryData(['tickets', 'usuario', 'andrea@pulsepass.co'])).toBeUndefined()
  })

  it('TEST-FE-AUTH-006: arranque silencioso con token inválido/expirado en servidor (401 en /auth/me) limpia el token y pasa a anónimo', async () => {
    const { router } = renderConProveedores({
      rutaInicial: '/cuenta',
      tokenInicial: 'token-invalido-servidor',
    })

    expect(await screen.findByRole('heading', { name: 'Inicia sesión' })).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/login')
    expect(leerTokenVigente()).toBeNull()
  })

  it('TEST-FE-AUTH-REG: registro con contraseña corta no envía petición; 409 muestra duplicado; 201 redirige a /login con aviso', async () => {
    const usuario = userEvent.setup()
    let peticionesRegistro = 0
    server.use(
      mswHttp.post('/api/users', async ({ request }) => {
        peticionesRegistro += 1
        const body = (await request.json()) as { username?: string }
        if (body.username === 'duplicado') {
          return HttpResponse.json(
            {
              timestamp: '2026-11-19T00:00:00',
              status: 409,
              error: 'Conflict',
              message: 'Username already exists',
              details: {},
            },
            { status: 409 },
          )
        }
        return new HttpResponse(null, { status: 201 })
      }),
    )

    renderConProveedores({ rutaInicial: '/registro' })
    expect(await screen.findByRole('heading', { name: 'Crea tu cuenta' })).toBeInTheDocument()

    await usuario.type(screen.getByLabelText('Nombre de usuario'), 'duplicado')
    await usuario.type(screen.getByLabelText('Correo electrónico'), 'andrea@pulsepass.co')
    await usuario.type(screen.getByLabelText('Nombres'), 'Andrea')
    await usuario.type(screen.getByLabelText('Apellidos'), 'Ruiz')
    await usuario.type(screen.getByLabelText('Fecha de nacimiento'), '1998-04-12')
    await usuario.type(screen.getByLabelText('Contraseña'), 'corta')
    await usuario.click(screen.getByRole('button', { name: 'Crear cuenta' }))

    expect(
      await screen.findByText('La contraseña debe tener entre 12 y 72 caracteres'),
    ).toBeInTheDocument()
    expect(peticionesRegistro).toBe(0)

    // Corregir contraseña y enviar con usuario duplicado → 409
    await usuario.clear(screen.getByLabelText('Contraseña'))
    await usuario.type(screen.getByLabelText('Contraseña'), 'ClaveSegura2026!')
    await usuario.click(screen.getByRole('button', { name: 'Crear cuenta' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'El usuario o correo ya está registrado',
    )

    // Cambiar usuario a uno disponible → 201 y redirección a /login con aviso
    await usuario.clear(screen.getByLabelText('Nombre de usuario'))
    await usuario.type(screen.getByLabelText('Nombre de usuario'), 'andrea_nueva')
    await usuario.click(screen.getByRole('button', { name: 'Crear cuenta' }))

    expect(await screen.findByRole('heading', { name: 'Inicia sesión' })).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('Cuenta creada, inicia sesión')
  })
})
