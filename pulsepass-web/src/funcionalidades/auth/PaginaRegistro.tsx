import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router'
import { Aviso } from '../../componentes/Aviso'
import { Boton } from '../../componentes/Boton'
import { Campo } from '../../componentes/Campo'
import { Tarjeta } from '../../componentes/Tarjeta'
import { esApiError, MENSAJE_ERROR_GENERICO } from '../../lib/http'
import { RUTAS } from '../../lib/rutas'
import { registrarUsuario } from './api'
import { RegistroSchema, type RegistroForm } from './tipos'

const CAMPOS_REGISTRO: ReadonlySet<keyof RegistroForm> = new Set([
  'username',
  'email',
  'firstName',
  'lastName',
  'phone',
  'city',
  'birthDate',
  'password',
])

function esCampoRegistro(clave: string): clave is keyof RegistroForm {
  return CAMPOS_REGISTRO.has(clave as keyof RegistroForm)
}

export function PaginaRegistro() {
  const navigate = useNavigate()
  const [errorServidor, setErrorServidor] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegistroForm>({
    resolver: zodResolver(RegistroSchema),
    defaultValues: {
      username: '',
      email: '',
      firstName: '',
      lastName: '',
      phone: '',
      city: '',
      birthDate: '',
      password: '',
    },
  })

  async function onSubmit(datos: RegistroForm) {
    setErrorServidor(null)
    try {
      await registrarUsuario(datos)
      void navigate(RUTAS.login, { state: { registrado: true } })
    } catch (error) {
      if (esApiError(error)) {
        if (error.status === 409) {
          setErrorServidor('El usuario o correo ya está registrado')
          return
        }
        if (error.status === 400) {
          let asignadoACampo = false
          for (const [clave, mensaje] of Object.entries(error.details)) {
            if (esCampoRegistro(clave)) {
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
    <div className="mx-auto max-w-xl py-6">
      <Tarjeta className="flex flex-col gap-6">
        <header className="border-b-2 border-slate-900 pb-4">
          <p className="font-mono text-xs font-bold uppercase tracking-widest text-acento-500">
            Nuevo Pase · PulsePass
          </p>
          <h1 className="mt-1 font-titulo text-3xl font-extrabold uppercase">Crea tu cuenta</h1>
        </header>

        {errorServidor !== null && <Aviso tono="error">{errorServidor}</Aviso>}

        <form onSubmit={(e) => void handleSubmit(onSubmit)(e)} noValidate className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Campo
              etiqueta="Nombre de usuario"
              type="text"
              autoComplete="username"
              placeholder="andrea"
              error={errors.username?.message}
              {...register('username')}
            />

            <Campo
              etiqueta="Correo electrónico"
              type="email"
              autoComplete="email"
              placeholder="andrea@pulsepass.co"
              error={errors.email?.message}
              {...register('email')}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Campo
              etiqueta="Nombres"
              type="text"
              autoComplete="given-name"
              placeholder="Andrea"
              error={errors.firstName?.message}
              {...register('firstName')}
            />

            <Campo
              etiqueta="Apellidos"
              type="text"
              autoComplete="family-name"
              placeholder="Ruiz"
              error={errors.lastName?.message}
              {...register('lastName')}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Campo
              etiqueta="Fecha de nacimiento"
              type="date"
              autoComplete="bday"
              error={errors.birthDate?.message}
              {...register('birthDate')}
            />

            <Campo
              etiqueta="Ciudad (opcional)"
              type="text"
              autoComplete="address-level2"
              placeholder="Santa Marta"
              error={errors.city?.message}
              {...register('city')}
            />
          </div>

          <Campo
            etiqueta="Contraseña"
            type="password"
            autoComplete="new-password"
            placeholder="Mínimo 12 caracteres"
            ayuda="Debe tener entre 12 y 72 caracteres (máx. 72 bytes UTF-8)"
            error={errors.password?.message}
            {...register('password')}
          />

          <Boton type="submit" cargando={isSubmitting} anchoCompleto className="mt-2">
            Crear cuenta
          </Boton>
        </form>

        <footer className="border-t-2 border-slate-900 pt-4 text-center text-sm">
          ¿Ya tienes cuenta?{' '}
          <Link
            to={RUTAS.login}
            className="font-titulo font-bold uppercase text-marca-600 underline decoration-2 underline-offset-4 hover:text-marca-700"
          >
            Inicia sesión
          </Link>
        </footer>
      </Tarjeta>
    </div>
  )
}

export default PaginaRegistro
