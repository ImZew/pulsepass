import type { z } from 'zod'
import { leerTokenVigente } from './almacenSesion'
import { ErrorResponseSchema } from './tipos'

export const MENSAJE_ERROR_GENERICO = 'Ocurrió un error inesperado. Inténtalo más tarde.'
export const MENSAJE_ERROR_RED = 'No pudimos conectar con el servidor.'

export class ApiError extends Error {
  readonly status: number
  readonly details: Record<string, string>

  constructor(status: number, message: string, details: Record<string, string> = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = details
  }
}

export function esApiError(error: unknown): error is ApiError {
  return error instanceof ApiError
}

// —— Interceptor 401 ————————————————————————————————————————————
type ManejadorNoAutorizado = () => void
let manejadorNoAutorizado: ManejadorNoAutorizado | null = null

/** Registra el callback a ejecutar ante cualquier 401 (salvo el login). Devuelve la función para anularlo. */
export function registrarOnUnauthorized(manejador: ManejadorNoAutorizado): () => void {
  manejadorNoAutorizado = manejador
  return () => {
    if (manejadorNoAutorizado === manejador) manejadorNoAutorizado = null
  }
}

// —— Cliente ————————————————————————————————————————————————————
const BASE_API: string = import.meta.env.VITE_API_BASE_URL ?? '/api'
const RUTA_LOGIN = '/auth/login'

type MetodoHttp = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'

export interface OpcionesHttp {
  method?: MetodoHttp
  body?: unknown
  signal?: AbortSignal
}

export interface OpcionesHttpConEsquema<S extends z.ZodType> extends OpcionesHttp {
  schema: S
}

function construirUrl(ruta: string): string {
  const relativa = `${BASE_API.replace(/\/$/, '')}${ruta.startsWith('/') ? ruta : `/${ruta}`}`
  // URL absoluta: funciona igual en navegador y en jsdom/undici (pruebas).
  return new URL(relativa, window.location.origin).toString()
}

async function leerJsonSeguro(respuesta: Response): Promise<{ vacio: true } | { vacio: false; json: unknown }> {
  const texto = await respuesta.text()
  if (texto.trim() === '') return { vacio: true }
  return { vacio: false, json: JSON.parse(texto) as unknown }
}

async function construirApiError(respuesta: Response): Promise<ApiError> {
  try {
    const cuerpo = await leerJsonSeguro(respuesta)
    if (!cuerpo.vacio) {
      const parsed = ErrorResponseSchema.safeParse(cuerpo.json)
      if (parsed.success) {
        return new ApiError(respuesta.status, parsed.data.message, parsed.data.details)
      }
    }
  } catch {
    // cuerpo no JSON: cae al error genérico
  }
  return new ApiError(respuesta.status, MENSAJE_ERROR_GENERICO)
}

/**
 * Cliente HTTP sobre fetch nativo.
 * - Añade `Authorization: Bearer` solo si hay sesión vigente.
 * - Respuesta OK vacía → `undefined` (o `schema.parse(undefined)` si se pasó esquema).
 * - Respuesta OK con JSON → `schema.parse(json)` si hay esquema.
 * - Error → `ApiError` (ErrorResponse validado o mensaje genérico); 401 dispara `onUnauthorized`.
 */
export function http<S extends z.ZodType>(ruta: string, opciones: OpcionesHttpConEsquema<S>): Promise<z.output<S>>
export function http(ruta: string, opciones?: OpcionesHttp): Promise<unknown>
export async function http(
  ruta: string,
  opciones: OpcionesHttp & { schema?: z.ZodType } = {},
): Promise<unknown> {
  const { method = 'GET', body, signal, schema } = opciones

  const headers = new Headers({ Accept: 'application/json' })
  const sesion = leerTokenVigente()
  if (sesion !== null) {
    headers.set('Authorization', `Bearer ${sesion.token}`)
  }
  if (body !== undefined) {
    headers.set('Content-Type', 'application/json')
  }

  let respuesta: Response
  try {
    respuesta = await fetch(construirUrl(ruta), {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    })
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error
    throw new ApiError(0, MENSAJE_ERROR_RED)
  }

  if (!respuesta.ok) {
    const apiError = await construirApiError(respuesta)
    if (respuesta.status === 401 && !ruta.startsWith(RUTA_LOGIN)) {
      manejadorNoAutorizado?.()
    }
    throw apiError
  }

  let cuerpo: Awaited<ReturnType<typeof leerJsonSeguro>>
  try {
    cuerpo = await leerJsonSeguro(respuesta)
  } catch {
    throw new ApiError(respuesta.status, MENSAJE_ERROR_GENERICO)
  }

  const dato = cuerpo.vacio ? undefined : cuerpo.json
  return schema ? schema.parse(dato) : dato
}
