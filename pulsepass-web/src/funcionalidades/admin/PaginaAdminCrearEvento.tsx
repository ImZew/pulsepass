import { zodResolver } from '@hookform/resolvers/zod'
import { clsx } from 'clsx'
import { useId, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router'
import { Aviso } from '../../componentes/Aviso'
import { Boton } from '../../componentes/Boton'
import { Campo } from '../../componentes/Campo'
import { CodigoTexto } from '../../componentes/CodigoTexto'
import {
  CLASE_CONTROL,
  CLASE_CONTROL_ERROR,
  EnvolturaCampo,
} from '../../componentes/EnvolturaCampo'
import {
  IconoCalendario,
  IconoFlechaDerecha,
  IconoFlechaIzquierda,
} from '../../componentes/Iconos'
import { Selector, type OpcionSelector } from '../../componentes/Selector'
import { Tarjeta } from '../../componentes/Tarjeta'
import { ETIQUETA_CATEGORIA } from '../../lib/etiquetas'
import { normalizarFechaHoraBackend } from '../../lib/formato'
import { esApiError, MENSAJE_ERROR_GENERICO } from '../../lib/http'
import { RUTAS } from '../../lib/rutas'
import { useCrearEvento, useSedesActivas } from './hooks'
import {
  CrearEventoSchema,
  EventCategorySchema,
  registrarEventoCreadoEnSesion,
  type CrearEventoForm,
} from './tipos'

const CAMPOS_CREAR_EVENTO: ReadonlySet<keyof CrearEventoForm> = new Set([
  'eventCode',
  'name',
  'description',
  'category',
  'eventDate',
  'minimumAge',
  'venueCode',
])

function esCampoCrearEvento(clave: string): clave is keyof CrearEventoForm {
  return CAMPOS_CREAR_EVENTO.has(clave as keyof CrearEventoForm)
}

const OPCIONES_CATEGORIA: readonly OpcionSelector[] = EventCategorySchema.options.map(
  (categoria) => ({
    valor: categoria,
    etiqueta: `${ETIQUETA_CATEGORIA[categoria]} (${categoria})`,
  }),
)

export function PaginaAdminCrearEvento() {
  const idDescripcion = useId()
  const idDescripcionMensaje = `${idDescripcion}-mensaje`

  const consultaSedes = useSedesActivas()
  const crearEventoMutation = useCrearEvento()

  const [codigoCreado, setCodigoCreado] = useState<string | null>(null)
  const [errorServidor, setErrorServidor] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors },
  } = useForm<CrearEventoForm>({
    resolver: zodResolver(CrearEventoSchema),
    defaultValues: {
      eventCode: '',
      name: '',
      description: '',
      category: 'MUSIC',
      eventDate: '',
      minimumAge: 0,
      venueCode: '',
    },
  })

  const opcionesSedes: OpcionSelector[] = (consultaSedes.data ?? []).map((sede) => ({
    valor: sede.code,
    etiqueta: `${sede.name} (${sede.code}) · ${sede.city}`,
  }))

  async function alCrearEvento(datos: CrearEventoForm) {
    setCodigoCreado(null)
    setErrorServidor(null)

    const codigoLimpio = datos.eventCode.trim()
    try {
      await crearEventoMutation.mutateAsync(datos)
      registrarEventoCreadoEnSesion({
        eventCode: codigoLimpio,
        name: datos.name.trim(),
        category: datos.category,
        eventDate: normalizarFechaHoraBackend(datos.eventDate),
        venueCode: datos.venueCode.trim(),
        status: 'DRAFT',
      })
      setCodigoCreado(codigoLimpio)
      reset({
        eventCode: '',
        name: '',
        description: '',
        category: datos.category,
        eventDate: '',
        minimumAge: 0,
        venueCode: '',
      })
    } catch (error) {
      if (esApiError(error)) {
        if (error.status === 400) {
          let asignadoACampo = false
          for (const [clave, mensaje] of Object.entries(error.details)) {
            if (esCampoCrearEvento(clave)) {
              setError(clave, { message: mensaje })
              asignadoACampo = true
            }
          }
          if (!asignadoACampo) {
            setErrorServidor(error.message)
          }
          return
        }
        setErrorServidor(error.message)
        return
      }
      setErrorServidor(MENSAJE_ERROR_GENERICO)
    }
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8">
      <header className="marco-brutal bg-slate-900 p-6 text-white sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-white/20 pb-4">
          <div>
            <p className="font-mono text-xs font-bold uppercase tracking-widest text-amber-300">
              Consola Administrativa · Nuevo Registro
            </p>
            <h1 className="mt-1 font-titulo text-3xl font-extrabold uppercase sm:text-4xl">
              Crear evento
            </h1>
          </div>

          <Link
            to={RUTAS.adminEventos}
            className="inline-flex min-h-11 items-center gap-2 border-2 border-slate-900 bg-white px-4 py-2 font-titulo text-xs font-bold uppercase text-slate-900 shadow-brutal-sm hover:bg-amber-300"
          >
            <IconoFlechaIzquierda className="size-4" />
            <span>Volver a eventos</span>
          </Link>
        </div>

        <p className="mt-4 max-w-2xl font-mono text-xs text-slate-300">
          Registra un nuevo evento en el sistema. El evento se creará en estado borrador
          (DRAFT) para que posteriormente puedas asignarle artistas y publicarlo.
        </p>
      </header>

      {codigoCreado !== null && (
        <Aviso
          tono="exito"
          titulo="Evento creado exitosamente"
          onCerrar={() => setCodigoCreado(null)}
        >
          <div className="mt-1 flex flex-col gap-3">
            <p>
              El evento <CodigoTexto codigo={codigoCreado} /> fue registrado en estado{' '}
              <strong className="font-mono">DRAFT</strong>.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                to={RUTAS.adminGestionEvento(codigoCreado)}
                className="inline-flex min-h-11 items-center gap-2 border-2 border-slate-900 bg-marca-600 px-4 py-2 font-titulo text-xs font-bold uppercase text-white shadow-brutal-sm hover:bg-marca-700"
              >
                <span>Gestionar evento {codigoCreado}</span>
                <IconoFlechaDerecha className="size-4" />
              </Link>
              <Link
                to={RUTAS.adminEventos}
                className="inline-flex min-h-11 items-center border-2 border-slate-900 bg-white px-4 py-2 font-titulo text-xs font-bold uppercase text-slate-900 shadow-brutal-sm hover:bg-amber-300"
              >
                Ir al panel de eventos
              </Link>
            </div>
          </div>
        </Aviso>
      )}

      {errorServidor !== null && (
        <Aviso
          tono="error"
          titulo="No se pudo crear el evento"
          onCerrar={() => setErrorServidor(null)}
        >
          {errorServidor}
        </Aviso>
      )}

      <Tarjeta className="flex flex-col gap-6">
        <div className="border-b-2 border-slate-900 pb-3">
          <h2 className="font-titulo text-lg font-extrabold uppercase">
            Datos oficiales del evento
          </h2>
        </div>

        <form
          onSubmit={(e) => void handleSubmit(alCrearEvento)(e)}
          noValidate
          className="flex flex-col gap-5"
        >
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Campo
              etiqueta="Código del evento"
              placeholder="Ej. CMF-2026"
              error={errors.eventCode?.message}
              {...register('eventCode')}
            />

            <Campo
              etiqueta="Nombre del evento"
              placeholder="Ej. Caribbean Music Fest 2026"
              error={errors.name?.message}
              {...register('name')}
            />
          </div>

          <EnvolturaCampo
            idControl={idDescripcion}
            idMensaje={idDescripcionMensaje}
            etiqueta="Descripción"
            error={errors.description?.message}
            ayuda="Máximo 500 caracteres (opcional)"
          >
            <textarea
              id={idDescripcion}
              rows={3}
              placeholder="Describe la temática, experiencia y detalles del evento..."
              aria-invalid={Boolean(errors.description)}
              aria-describedby={idDescripcionMensaje}
              className={clsx(
                CLASE_CONTROL,
                'min-h-24 resize-y',
                errors.description && CLASE_CONTROL_ERROR,
              )}
              {...register('description')}
            />
          </EnvolturaCampo>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Selector
              etiqueta="Categoría"
              opciones={OPCIONES_CATEGORIA}
              error={errors.category?.message}
              {...register('category')}
            />

            <Campo
              etiqueta="Edad mínima"
              type="number"
              min={0}
              placeholder="18"
              error={errors.minimumAge?.message}
              {...register('minimumAge', { valueAsNumber: true })}
            />
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Campo
              etiqueta="Fecha y hora del evento"
              type="datetime-local"
              error={errors.eventDate?.message}
              {...register('eventDate')}
            />

            <Selector
              etiqueta="Sede"
              marcador="Selecciona una sede"
              opciones={opcionesSedes}
              error={errors.venueCode?.message}
              {...register('venueCode')}
            />
          </div>

          <div className="flex flex-wrap items-center justify-end gap-3 border-t-2 border-slate-900 pt-5">
            <Link
              to={RUTAS.adminEventos}
              className="inline-flex min-h-11 items-center justify-center border-2 border-slate-900 bg-white px-5 py-2.5 font-titulo text-sm font-bold uppercase text-slate-900 shadow-brutal-sm hover:bg-slate-100"
            >
              Cancelar
            </Link>

            <Boton type="submit" cargando={crearEventoMutation.isPending}>
              <IconoCalendario className="size-4" />
              <span>Crear evento</span>
            </Boton>
          </div>
        </form>
      </Tarjeta>
    </div>
  )
}

export default PaginaAdminCrearEvento
