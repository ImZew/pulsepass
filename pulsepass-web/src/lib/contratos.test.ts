import { describe, expect, it } from 'vitest'
import { ArtistResponseSchema } from '../funcionalidades/artistas/tipos'
import {
  AuthenticatedUserResponseSchema,
  AuthResponseSchema,
  LoginSchema,
  RegistroSchema,
} from '../funcionalidades/auth/tipos'
import {
  CrearEventoSchema,
  EventResponseSchema,
  EventSummaryResponseSchema,
} from '../funcionalidades/eventos/tipos'
import { VenueResponseSchema } from '../funcionalidades/sedes/tipos'
import {
  CompraTicketSchema,
  TicketResponseSchema,
  ValidacionTicketSchema,
} from '../funcionalidades/tickets/tipos'
import { UserResponseSchema } from '../funcionalidades/usuarios/tipos'
import { ErrorResponseSchema } from './tipos'

describe('Contratos Zod — Etapa 1 y 2', () => {
  it('EventSummaryResponseSchema acepta respuestas del backend real (sin category/city) y de mocks con ellos', () => {
    const real = EventSummaryResponseSchema.parse({
      eventCode: 'CMF-2026',
      name: 'Caribbean Music Fest 2026',
      status: 'PUBLISHED',
      eventDate: '2026-12-01T20:00:00',
      venueName: 'Estadio Sierra Nevada',
    })
    expect(real.category).toBeUndefined()

    const conOpcionales = EventSummaryResponseSchema.parse({
      eventCode: 'CMF-2026',
      name: 'Caribbean Music Fest 2026',
      status: 'PUBLISHED',
      eventDate: '2026-12-01T20:00:00',
      venueName: 'Estadio Sierra Nevada',
      category: 'MUSIC',
      city: 'Santa Marta',
    })
    expect(conOpcionales.category).toBe('MUSIC')
    expect(conOpcionales.city).toBe('Santa Marta')
  })

  it('CrearEventoSchema acepta datetime-local con o sin segundos', () => {
    const sinSegundos = CrearEventoSchema.parse({
      eventCode: 'TECH-2026',
      name: 'Caribe Tech Summit',
      description: 'Cumbre regional',
      category: 'TECHNOLOGY',
      eventDate: '2026-11-25T09:30',
      minimumAge: 18,
      venueCode: 'VEN-SM-01',
    })
    expect(sinSegundos.eventDate).toBe('2026-11-25T09:30')
  })

  it('valida el resto de esquemas principales de dominio y seguridad', () => {
    expect(
      ErrorResponseSchema.parse({
        timestamp: '2026-11-18T13:00:00',
        status: 409,
        error: 'Conflict',
        message: 'Only PAID tickets can be marked as USED',
        details: {},
      }).status,
    ).toBe(409)

    expect(
      AuthResponseSchema.parse({
        accessToken: 'jwt.token.aqui',
        tokenType: 'Bearer',
        expiresIn: 900,
      }).expiresIn,
    ).toBe(900)

    expect(
      AuthenticatedUserResponseSchema.parse({
        id: 1,
        username: 'andrea',
        email: 'andrea@pulsepass.co',
        roles: ['USER'],
      }).roles,
    ).toEqual(['USER'])

    expect(
      UserResponseSchema.parse({
        username: 'andrea',
        email: 'andrea@pulsepass.co',
        active: true,
      }).active,
    ).toBe(true)

    expect(
      VenueResponseSchema.parse({
        code: 'VEN-01',
        name: 'Teatro Santa Marta',
        city: 'Santa Marta',
        capacity: 1200,
        active: true,
      }).capacity,
    ).toBe(1200)

    expect(
      ArtistResponseSchema.parse({
        id: 10,
        stageName: 'Bomba Estéreo',
        active: true,
      }).stageName,
    ).toBe('Bomba Estéreo')

    expect(
      EventResponseSchema.parse({
        id: 5,
        eventCode: 'CMF-2026',
        name: 'Caribbean Music Fest',
        description: null,
        category: 'MUSIC',
        status: 'PUBLISHED',
        eventDate: '2026-12-01T20:00:00',
        minimumAge: 18,
        venueCode: 'VEN-01',
        venueName: 'Teatro Santa Marta',
        artists: [{ id: 10, stageName: 'Bomba Estéreo', active: true }],
      }).artists,
    ).toHaveLength(1)

    expect(
      TicketResponseSchema.parse({
        id: 99,
        ticketCode: '8F2A1C00',
        type: 'VIP',
        price: 100,
        status: 'PAID',
        purchaseDate: '2026-11-18T12:00:00',
        userEmail: 'andrea@pulsepass.co',
        eventCode: 'CMF-2026',
        eventName: 'Caribbean Music Fest',
      }).price,
    ).toBe(100)

    expect(LoginSchema.parse({ identifier: 'andrea', password: 'secretPassword123' }).identifier).toBe(
      'andrea',
    )
    expect(CompraTicketSchema.parse({ type: 'VIP' }).type).toBe('VIP')
    expect(ValidacionTicketSchema.parse({ ticketCode: '8F2A1C00' }).ticketCode).toBe('8F2A1C00')
    expect(
      RegistroSchema.safeParse({
        username: 'andrea',
        email: 'andrea@pulsepass.co',
        firstName: 'Andrea',
        lastName: 'Gómez',
        birthDate: '2000-05-14',
        password: 'corta',
      }).success,
    ).toBe(false)
  })
})
