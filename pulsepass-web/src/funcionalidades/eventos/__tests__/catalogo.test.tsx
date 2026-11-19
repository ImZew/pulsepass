import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http as mswHttp, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { server } from '../../../test/mocks/server'
import { renderConProveedores } from '../../../test/utils'

describe('Catálogo Público — Inicio, Eventos, Artistas y Sedes (Etapa 5)', () => {
  it('Inicio (/): renderiza Hero Cinematográfico, próximos eventos y artistas destacados', async () => {
    renderConProveedores({ rutaInicial: '/' })

    expect(
      await screen.findByRole('heading', { name: 'Descubre los mejores eventos' }),
    ).toBeInTheDocument()
    expect(await screen.findByText('Caribbean Music Fest 2026')).toBeInTheDocument()
    expect(await screen.findByText('Solar Beat')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /ver cartelera/i })).toHaveAttribute(
      'href',
      '/eventos',
    )
  })

  it('TEST-FE-EVT-001: cartelera (/eventos) lista eventos publicados', async () => {
    renderConProveedores({ rutaInicial: '/eventos' })

    expect(await screen.findByRole('heading', { name: 'Cartelera' })).toBeInTheDocument()
    expect(await screen.findByText('Caribbean Music Fest 2026')).toBeInTheDocument()
    expect(screen.getByText('Caribe Tech Summit 2026')).toBeInTheDocument()
  })

  it('TEST-FE-EVT-002: cartelera con lista vacía muestra estado vacío "Aún no hay eventos publicados"', async () => {
    server.use(mswHttp.get('/api/events/published', () => HttpResponse.json([])))
    renderConProveedores({ rutaInicial: '/eventos' })

    expect(
      await screen.findByRole('heading', { name: 'Aún no hay eventos publicados' }),
    ).toBeInTheDocument()
  })

  it('TEST-FE-EVT-003: filtro por texto y categoría actualiza la URL (?q= y ?categoria=) y filtra la lista', async () => {
    const usuario = userEvent.setup()
    const { router } = renderConProveedores({ rutaInicial: '/eventos' })

    expect(await screen.findByText('Caribbean Music Fest 2026')).toBeInTheDocument()
    expect(screen.getByText('Caribe Tech Summit 2026')).toBeInTheDocument()

    // Filtrar por categoría TECHNOLOGY → ?categoria=TECHNOLOGY
    const selectorCategoria = screen.getByLabelText('Categoría')
    await usuario.selectOptions(selectorCategoria, 'TECHNOLOGY')

    expect(router.state.location.search).toContain('categoria=TECHNOLOGY')
    expect(screen.getByText('Caribe Tech Summit 2026')).toBeInTheDocument()
    expect(screen.queryByText('Caribbean Music Fest 2026')).not.toBeInTheDocument()

    // Filtrar por texto inexistente → estado vacío "Sin resultados para tu búsqueda"
    const inputBusqueda = screen.getByLabelText('Buscar evento')
    await usuario.type(inputBusqueda, 'inexistente')
    expect(router.state.location.search).toContain('q=inexistente')
    expect(
      await screen.findByRole('heading', { name: 'Sin resultados para tu búsqueda' }),
    ).toBeInTheDocument()
  })

  it('TEST-FE-EVT-004: detalle de evento (/eventos/:eventCode) muestra evento, artistas, sede y edad mínima', async () => {
    renderConProveedores({
      rutaInicial: '/eventos/CMF-2026',
      tokenInicial: 'jwt-user-token',
    })

    expect(
      await screen.findByRole('heading', { name: 'Caribbean Music Fest 2026' }),
    ).toBeInTheDocument()
    expect(screen.getByText('CMF-2026')).toBeInTheDocument()
    expect(screen.getByText(/Edad mínima: 18 años/i)).toBeInTheDocument()
    expect(screen.getByText('Solar Beat')).toBeInTheDocument()
    expect(screen.getByText('Neon Waves')).toBeInTheDocument()
    expect(screen.getAllByText('Marina Convention Center').length).toBeGreaterThan(0)
    expect(screen.getByRole('link', { name: /comprar ticket/i })).toBeInTheDocument()
  })

  it('TEST-FE-EVT-005: detalle de evento con 404 muestra "Evento no disponible"', async () => {
    renderConProveedores({ rutaInicial: '/eventos/NO-EXISTE' })

    expect(
      await screen.findByRole('heading', { name: 'Evento no disponible' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Volver a la cartelera' })).toHaveAttribute(
      'href',
      '/eventos',
    )
  })

  it('TEST-FE-EVT-006: detalle de evento SOLD_OUT muestra compra deshabilitada', async () => {
    renderConProveedores({
      rutaInicial: '/eventos/SOLD-2026',
      tokenInicial: 'jwt-user-token',
    })

    expect(
      await screen.findByRole('heading', { name: 'Concierto Agotado 2026' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Comprar entrada' })).toBeDisabled()
    expect(
      screen.getByText(/Evento no disponible para compra \(SOLD_OUT\)/i),
    ).toBeInTheDocument()
  })

  it('TEST-FE-ART-001 y TEST-FE-ART-002: lista de artistas activos y detalle de artista con sus eventos', async () => {
    const usuario = userEvent.setup()
    renderConProveedores({ rutaInicial: '/artistas' })

    expect(await screen.findByRole('heading', { name: 'Artistas' })).toBeInTheDocument()
    expect(await screen.findByText('Solar Beat')).toBeInTheDocument()
    expect(screen.getByText('Neon Waves')).toBeInTheDocument()

    await usuario.click(screen.getByRole('link', { name: /Solar Beat/i }))

    expect(
      await screen.findByRole('heading', { name: 'Próximos eventos de Solar Beat' }),
    ).toBeInTheDocument()
    expect(await screen.findByText('Caribbean Music Fest 2026')).toBeInTheDocument()
  })

  it('TEST-FE-ART-003: id de artista no numérico muestra 404 sin llamar a la API', async () => {
    let llamadasApiArtista = 0
    server.use(
      mswHttp.get('/api/artists/:id', () => {
        llamadasApiArtista += 1
        return HttpResponse.json({ id: 1, stageName: 'Solar Beat', active: true })
      }),
    )

    renderConProveedores({ rutaInicial: '/artistas/no-numerico' })

    expect(
      await screen.findByRole('heading', { name: 'No encontramos esta página' }),
    ).toBeInTheDocument()
    expect(llamadasApiArtista).toBe(0)
  })

  it('TEST-FE-VEN-001: lista de sedes, detalle de sede con capacidad y 404 para sede inexistente', async () => {
    const usuario = userEvent.setup()
    const vista = renderConProveedores({ rutaInicial: '/sedes' })

    expect(await screen.findByRole('heading', { name: 'Sedes' })).toBeInTheDocument()
    expect(await screen.findByText('Marina Convention Center')).toBeInTheDocument()
    expect(screen.getByText('Coliseo Capital')).toBeInTheDocument()

    await usuario.click(screen.getByRole('link', { name: /Marina Convention Center/i }))

    expect(
      await screen.findByRole('heading', { name: 'Marina Convention Center' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Capacidad: 3000 personas')).toBeInTheDocument()
    vista.unmount()

    renderConProveedores({ rutaInicial: '/sedes/VEN-INEXISTENTE' })
    expect(
      await screen.findByRole('heading', { name: 'No encontramos esta página' }),
    ).toBeInTheDocument()
  })
})
