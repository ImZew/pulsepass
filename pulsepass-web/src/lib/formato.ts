const formateadorCOP = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

const formateadorFechaLarga = new Intl.DateTimeFormat('es-CO', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
})

const formateadorHora = new Intl.DateTimeFormat('es-CO', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
})

export function formatearCOP(valor: number): string {
  return formateadorCOP.format(valor)
}

function parsearFechaLocal(isoLocal: string): Date {
  const limpia = isoLocal.endsWith('Z') ? isoLocal.slice(0, -1) : isoLocal
  const fecha = new Date(limpia)
  return fecha
}

export function formatearFechaEvento(isoLocal: string): string {
  const fecha = parsearFechaLocal(isoLocal)
  if (Number.isNaN(fecha.getTime())) {
    return isoLocal
  }
  return `${formateadorFechaLarga.format(fecha)} · ${formateadorHora.format(fecha)}`
}

export function formatearFechaCorta(isoLocal: string): string {
  const fecha = parsearFechaLocal(isoLocal)
  if (Number.isNaN(fecha.getTime())) {
    return isoLocal
  }
  return formateadorFechaLarga.format(fecha)
}

export function normalizarFechaHoraBackend(valorInput: string): string {
  const limpio = valorInput.trim()
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(limpio)) {
    return `${limpio}:00`
  }
  return limpio
}
