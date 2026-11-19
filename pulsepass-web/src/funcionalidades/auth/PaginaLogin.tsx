import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useLocation, useNavigate } from 'react-router'
import { Aviso } from '../../componentes/Aviso'
import { Boton } from '../../componentes/Boton'
import { Campo } from '../../componentes/Campo'
import { Tarjeta } from '../../componentes/Tarjeta'
import { esApiError, MENSAJE_ERROR_GENERICO } from '../../lib/http'
import { RUTAS } from '../../lib/rutas'
import { useAuth } from './hooks'
import { LoginSchema, type LoginForm } from './tipos'

interface EstadoUbicacionLogin {
  desde?: string
  registrado?: boolean
  motivo?: 'expirada'
}

function esEstadoUbicacionLogin(state: unknown): state is EstadoUbicacionLogin {
  return typeof state === 'object' && state !== null
}

const CAMPOS_LOGIN: ReadonlySet<keyof LoginForm> = new Set(['identifier', 'password'])

function esCampoLogin(clave: string): clave is keyof LoginForm {
  return CAMPOS_LOGIN.has(clave as keyof LoginForm)
}

export function PaginaLogin() {
  const { iniciarSesion, sesionExpirada, limpiarAvisoExpiracion } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const estadoNav = esEstadoUbicacionLogin(location.state) ? location.state : {}

  const [errorServidor, setErrorServidor] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      identifier: '',
      password: '',
    },
  })

  const mostrarAvisoExpirada = estadoNav.motivo === 'expirada' || sesionExpirada
  const mostrarAvisoRegistrado = estadoNav.registrado === true

  async function onSubmit(datos: LoginForm) {
    setErrorServidor(null)
    limpiarAvisoExpiracion()
    try {
      await iniciarSesion(datos.identifier, datos.password)
      const destino =
        typeof estadoNav.desde === 'string' && estadoNav.desde.startsWith('/')
          ? estadoNav.desde
          : RUTAS.inicio
      void navigate(destino, { replace: true })
    } catch (error) {
      if (esApiError(error)) {
        if (error.status === 401) {
          setErrorServidor('Credenciales inválidas')
          return
        }
        if (error.status === 400) {
          let asignadoACampo = false
          for (const [clave, mensaje] of Object.entries(error.details)) {
            if (esCampoLogin(clave)) {
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
    <div className="mx-auto max-w-md py-6">
      <Tarjeta className="flex flex-col gap-6">
        <header className="border-b-2 border-slate-900 pb-4">
          <p className="font-mono text-xs font-bold uppercase tracking-widest text-marca-600">
            Acceso · PulsePass
          </p>
          <h1 className="mt-1 font-titulo text-3xl font-extrabold uppercase">Inicia sesión</h1>
        </header>

        {mostrarAvisoRegistrado && (
          <Aviso tono="exito">Cuenta creada, inicia sesión</Aviso>
        )}

        {mostrarAvisoExpirada && (
          <Aviso tono="advertencia">Tu sesión expiró</Aviso>
        )}

        {errorServidor !== null && <Aviso tono="error">{errorServidor}</Aviso>}

        <form onSubmit={(e) => void handleSubmit(onSubmit)(e)} noValidate className="flex flex-col gap-4">
          <Campo
            etiqueta="Usuario o correo"
            type="text"
            autoComplete="username"
            placeholder="andrea o andrea@pulsepass.co"
            error={errors.identifier?.message}
            {...register('identifier')}
          />

          <Campo
            etiqueta="Contraseña"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••••••"
            error={errors.password?.message}
            {...register('password')}
          />

          <Boton type="submit" cargando={isSubmitting} anchoCompleto className="mt-2">
            Ingresar
          </Boton>
        </form>

        <footer className="border-t-2 border-slate-900 pt-4 text-center text-sm">
          ¿No tienes cuenta?{' '}
          <Link
            to={RUTAS.registro}
            className="font-titulo font-bold uppercase text-marca-600 underline decoration-2 underline-offset-4 hover:text-marca-700"
          >
            Regístrate
          </Link>
        </footer>
      </Tarjeta>
    </div>
  )
}

export default PaginaLogin
