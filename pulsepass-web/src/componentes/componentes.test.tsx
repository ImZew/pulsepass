import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { Aviso } from './Aviso'
import { BadgeCategoria, BadgeEstadoEvento, BadgeEstadoTicket } from './Badge'
import { Boton } from './Boton'
import { Campo } from './Campo'
import { Cargando } from './Cargando'
import { CodigoTexto } from './CodigoTexto'
import { EstadoError } from './EstadoError'
import { EstadoVacio } from './EstadoVacio'
import { Modal } from './Modal'
import { Selector } from './Selector'
import { Tabla } from './Tabla'
import { Tarjeta } from './Tarjeta'

describe('Boton', () => {
  it('renderiza variantes y ejecuta onClick', async () => {
    const usuario = userEvent.setup()
    const onClick = vi.fn()
    render(
      <Boton variante="peligro" onClick={onClick}>
        Cancelar ticket
      </Boton>,
    )
    const boton = screen.getByRole('button', { name: 'Cancelar ticket' })
    expect(boton).toHaveAttribute('type', 'button')
    expect(boton.className).toContain('bg-red-600')
    await usuario.click(boton)
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('cargando → "Cargando...", deshabilitado y sin disparar onClick', async () => {
    const usuario = userEvent.setup()
    const onClick = vi.fn()
    render(
      <Boton cargando onClick={onClick}>
        Comprar
      </Boton>,
    )
    const boton = screen.getByRole('button', { name: /cargando\.\.\./i })
    expect(boton).toBeDisabled()
    expect(boton).toHaveAttribute('aria-busy', 'true')
    expect(screen.queryByText('Comprar')).not.toBeInTheDocument()
    await usuario.click(boton)
    expect(onClick).not.toHaveBeenCalled()
  })
})

describe('Campo', () => {
  it('asocia label, aria-invalid y aria-describedby con el error', () => {
    render(<Campo etiqueta="Correo electrónico" type="email" error="Ingresa un correo electrónico válido" />)
    const input = screen.getByLabelText('Correo electrónico')
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(input).toHaveAccessibleDescription('Ingresa un correo electrónico válido')
  })

  it('sin error muestra la ayuda y aria-invalid="false"', async () => {
    const usuario = userEvent.setup()
    render(<Campo etiqueta="Contraseña" type="password" ayuda="Mínimo 12 caracteres" />)
    const input = screen.getByLabelText('Contraseña')
    expect(input).toHaveAttribute('aria-invalid', 'false')
    expect(input).toHaveAccessibleDescription('Mínimo 12 caracteres')
    await usuario.type(input, 'secreto')
    expect(input).toHaveValue('secreto')
  })
})

describe('Selector', () => {
  it('renderiza opciones con marcador, permite seleccionar y muestra error', async () => {
    const usuario = userEvent.setup()
    render(
      <Selector
        etiqueta="Tipo de ticket"
        marcador="Selecciona un tipo"
        opciones={[
          { valor: 'GENERAL', etiqueta: 'General' },
          { valor: 'VIP', etiqueta: 'VIP' },
        ]}
        error="Selecciona un tipo de ticket"
        defaultValue=""
      />,
    )
    const select = screen.getByLabelText('Tipo de ticket')
    expect(within(select).getAllByRole('option')).toHaveLength(3)
    expect(select).toHaveAttribute('aria-invalid', 'true')
    expect(select).toHaveAccessibleDescription('Selecciona un tipo de ticket')
    await usuario.selectOptions(select, 'VIP')
    expect(select).toHaveValue('VIP')
  })
})

function ModalDePrueba({ onCerrar }: { onCerrar: () => void }) {
  const [error, setError] = useState<string | null>(null)
  return (
    <Modal
      abierto
      titulo="Confirmar compra"
      onCerrar={onCerrar}
      pie={
        <>
          <Boton variante="secundario" onClick={onCerrar}>
            Volver
          </Boton>
          <Boton onClick={() => setError('El evento no cumple la edad mínima')}>Confirmar</Boton>
        </>
      }
    >
      {error !== null && <Aviso tono="error">{error}</Aviso>}
      <p>Ticket VIP</p>
    </Modal>
  )
}

describe('Modal', () => {
  it('no renderiza nada cuando abierto=false', () => {
    render(
      <Modal abierto={false} titulo="Oculto" onCerrar={() => undefined}>
        contenido
      </Modal>,
    )
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('role="dialog" con aria-modal y título accesible; foco inicial dentro', () => {
    render(<ModalDePrueba onCerrar={() => undefined} />)
    const dialogo = screen.getByRole('dialog', { name: 'Confirmar compra' })
    expect(dialogo).toHaveAttribute('aria-modal', 'true')
    expect(dialogo).toContainElement(document.activeElement as HTMLElement)
  })

  it('cierra con Escape y con el botón Cerrar', async () => {
    const usuario = userEvent.setup()
    const onCerrar = vi.fn()
    render(<ModalDePrueba onCerrar={onCerrar} />)
    await usuario.keyboard('{Escape}')
    await usuario.click(screen.getByRole('button', { name: 'Cerrar' }))
    expect(onCerrar).toHaveBeenCalledTimes(2)
  })

  it('atrapa el foco con Tab / Shift+Tab', async () => {
    const usuario = userEvent.setup()
    render(<ModalDePrueba onCerrar={() => undefined} />)
    const cerrar = screen.getByRole('button', { name: 'Cerrar' })
    const confirmar = screen.getByRole('button', { name: 'Confirmar' })
    expect(cerrar).toHaveFocus()
    await usuario.tab({ shift: true })
    expect(confirmar).toHaveFocus()
    await usuario.tab()
    expect(cerrar).toHaveFocus()
  })

  it('muestra un error 409 dentro del modal sin cerrarlo (DES-10)', async () => {
    const usuario = userEvent.setup()
    const onCerrar = vi.fn()
    render(<ModalDePrueba onCerrar={onCerrar} />)
    await usuario.click(screen.getByRole('button', { name: 'Confirmar' }))
    const dialogo = screen.getByRole('dialog')
    expect(within(dialogo).getByRole('alert')).toHaveTextContent('El evento no cumple la edad mínima')
    expect(onCerrar).not.toHaveBeenCalled()
  })
})

interface FilaTicket {
  ticketCode: string
  type: string
  userEmail: string
}

describe('Tabla<T>', () => {
  const filas: FilaTicket[] = [
    { ticketCode: 'A1B2C3D4', type: 'VIP', userEmail: 'andrea@pulsepass.co' },
    { ticketCode: 'E5F6G7H8', type: 'GENERAL', userEmail: 'carlos@pulsepass.co' },
  ]

  it('renderiza encabezados y filas en la tabla de escritorio y tarjetas en móvil', () => {
    render(
      <Tabla
        descripcion="Tickets pagados"
        filas={filas}
        claveFila={(f) => f.ticketCode}
        columnas={[
          { encabezado: 'Código', celda: (f) => f.ticketCode },
          { encabezado: 'Tipo', celda: (f) => f.type },
          { encabezado: 'Usuario', celda: (f) => f.userEmail },
        ]}
      />,
    )
    const tabla = screen.getByRole('table', { name: 'Tickets pagados' })
    expect(within(tabla).getAllByRole('columnheader').map((th) => th.textContent)).toEqual([
      'Código',
      'Tipo',
      'Usuario',
    ])
    expect(within(tabla).getAllByRole('row')).toHaveLength(3)
    expect(within(tabla).getByRole('cell', { name: 'carlos@pulsepass.co' })).toBeInTheDocument()

    const listaMovil = screen.getByRole('list', { name: 'Tickets pagados' })
    expect(within(listaMovil).getAllByRole('listitem')).toHaveLength(2)
  })
})

describe('Aviso', () => {
  it('error y advertencia usan role="alert"', () => {
    render(
      <>
        <Aviso tono="error">Falló</Aviso>
        <Aviso tono="advertencia">Cuidado</Aviso>
      </>,
    )
    expect(screen.getAllByRole('alert')).toHaveLength(2)
  })

  it('exito e info usan role="status" con aria-live="polite" y pueden cerrarse', async () => {
    const usuario = userEvent.setup()
    const onCerrar = vi.fn()
    render(
      <Aviso tono="exito" titulo="Listo" onCerrar={onCerrar}>
        Cuenta creada
      </Aviso>,
    )
    const aviso = screen.getByRole('status')
    expect(aviso).toHaveAttribute('aria-live', 'polite')
    expect(aviso).toHaveTextContent('Cuenta creada')
    await usuario.click(screen.getByRole('button', { name: 'Cerrar aviso' }))
    expect(onCerrar).toHaveBeenCalled()
  })
})

describe('Estados (Cargando, EstadoVacio, EstadoError)', () => {
  it('Cargando expone aria-busy y texto accesible', () => {
    render(<Cargando variante="tarjetas" cantidad={3} />)
    const estado = screen.getByRole('status')
    expect(estado).toHaveAttribute('aria-busy', 'true')
    expect(estado).toHaveTextContent('Cargando...')
  })

  it('EstadoVacio muestra mensaje y CTA', () => {
    render(<EstadoVacio mensaje="Aún no tienes tickets" accion={<a href="/eventos">Ver cartelera</a>} />)
    expect(screen.getByRole('heading', { name: 'Aún no tienes tickets' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Ver cartelera' })).toHaveAttribute('href', '/eventos')
  })

  it('EstadoError muestra "Reintentar" solo con onReintentar', async () => {
    const usuario = userEvent.setup()
    const onReintentar = vi.fn()
    const { rerender } = render(<EstadoError mensaje="No pudimos conectar con el servidor." />)
    expect(screen.getByRole('alert')).toHaveTextContent('No pudimos conectar con el servidor.')
    expect(screen.queryByRole('button', { name: 'Reintentar' })).not.toBeInTheDocument()

    rerender(<EstadoError mensaje="No pudimos conectar con el servidor." onReintentar={onReintentar} />)
    await usuario.click(screen.getByRole('button', { name: 'Reintentar' }))
    expect(onReintentar).toHaveBeenCalledTimes(1)
  })
})

describe('Badges, CodigoTexto y Tarjeta', () => {
  it('badges muestran el valor del contrato y la categoría en español', () => {
    render(
      <>
        <BadgeEstadoEvento estado="SOLD_OUT" />
        <BadgeEstadoTicket estado="PAID" />
        <BadgeCategoria categoria="MUSIC" />
      </>,
    )
    expect(screen.getByText('SOLD_OUT').className).toContain('bg-amber-100')
    expect(screen.getByText('PAID').className).toContain('bg-emerald-100')
    expect(screen.getByText('Música')).toBeInTheDocument()
  })

  it('CodigoTexto copia el código al portapapeles', async () => {
    const usuario = userEvent.setup()
    render(<CodigoTexto codigo="TKT-8F2A1C" copiable />)
    expect(screen.getByText('TKT-8F2A1C').tagName).toBe('CODE')
    await usuario.click(screen.getByRole('button', { name: 'Copiar' }))
    expect(await screen.findByRole('button', { name: 'Copiado' })).toBeInTheDocument()
    await expect(navigator.clipboard.readText()).resolves.toBe('TKT-8F2A1C')
  })

  it('Tarjeta interactiva3D no falla en JSDOM al mover el puntero', async () => {
    const usuario = userEvent.setup()
    render(
      <Tarjeta interactiva3D data-testid="tarjeta">
        Evento
      </Tarjeta>,
    )
    const tarjeta = screen.getByTestId('tarjeta')
    expect(tarjeta.className).toContain('tarjeta-3d')
    await usuario.pointer({ target: tarjeta, coords: { clientX: 10, clientY: 10 } })
    await usuario.unhover(tarjeta)
    expect(tarjeta).toHaveTextContent('Evento')
  })
})
