import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { PrecioCOP } from '../componentes/PrecioCOP'
import { formatearCOP, normalizarFechaHoraBackend } from './formato'

describe('TEST-FE-LIB-005 — Formato COP y fechas', () => {
  it('TEST-FE-LIB-005: PrecioCOP formatea 250000 como COP', () => {
    render(<PrecioCOP valor={250000} />)
    const texto = screen.getByText(/250\.000/)
    expect(texto).toBeInTheDocument()
    expect(formatearCOP(250000)).toMatch(/250\.000/)
  })

  it('normaliza datetime-local sin segundos al formato esperado por el backend', () => {
    expect(normalizarFechaHoraBackend('2026-12-01T20:00')).toBe('2026-12-01T20:00:00')
    expect(normalizarFechaHoraBackend('2026-12-01T20:00:00')).toBe('2026-12-01T20:00:00')
  })
})
