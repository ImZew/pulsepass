import { TokenGuardadoSchema, type TokenGuardado } from '../funcionalidades/auth/tipos'

/**
 * Almacén del token de acceso: memoria + sessionStorage (nunca localStorage ni cookies).
 * El valor leído de sessionStorage se valida con zod y se descarta si es inválido o expiró.
 */
const CLAVE = 'pulsepass.sesion'

let enMemoria: TokenGuardado | null = null

function ahora(): number {
  return Date.now()
}

function leerDeSessionStorage(): TokenGuardado | null {
  try {
    const crudo = window.sessionStorage.getItem(CLAVE)
    if (crudo === null) return null
    const json: unknown = JSON.parse(crudo)
    const resultado = TokenGuardadoSchema.safeParse(json)
    return resultado.success ? resultado.data : null
  } catch {
    return null
  }
}

export function guardarToken(token: string, expiresInSegundos: number): TokenGuardado {
  const valor: TokenGuardado = { token, expiraEn: ahora() + expiresInSegundos * 1000 }
  enMemoria = valor
  try {
    window.sessionStorage.setItem(CLAVE, JSON.stringify(valor))
  } catch {
    // sessionStorage no disponible: el token sigue viviendo en memoria.
  }
  return valor
}

/** Devuelve el token vigente (memoria primero, luego sessionStorage). Limpia si expiró. */
export function leerTokenVigente(): TokenGuardado | null {
  const valor = enMemoria ?? leerDeSessionStorage()
  if (valor === null) return null
  if (valor.expiraEn <= ahora()) {
    borrarToken()
    return null
  }
  enMemoria = valor
  return valor
}

export function borrarToken(): void {
  enMemoria = null
  try {
    window.sessionStorage.removeItem(CLAVE)
  } catch {
    // sin acción
  }
}
