import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router'
import { Aviso } from '../../componentes/Aviso'
import { Boton } from '../../componentes/Boton'
import { CodigoTexto } from '../../componentes/CodigoTexto'
import { Modal } from '../../componentes/Modal'
import { Selector, type OpcionSelector } from '../../componentes/Selector'
import { ETIQUETA_TIPO_TICKET } from '../../lib/etiquetas'
import { esApiError, MENSAJE_ERROR_GENERICO } from '../../lib/http'
import { RUTAS } from '../../lib/rutas'
import { TicketTypeSchema, type TicketType } from '../../lib/tipos'
import { useComprarTicket } from './hooks'
import { CompraSchema, type CompraTicketForm } from './tipos'

export interface ModalCompraTicketProps {
  abierto: boolean
  eventCode: string
  eventName: string
  userEmail: string
  tipoInicial?: TicketType
  onCerrar: () => void
}

const OPCIONES_TIPO_TICKET: readonly OpcionSelector[] = TicketTypeSchema.options.map((tipo) => ({
  valor: tipo,
  etiqueta: `${ETIQUETA_TIPO_TICKET[tipo]} (${tipo})`,
}))

export function ModalCompraTicket({
  abierto,
  eventCode,
  eventName,
  userEmail,
  tipoInicial = 'GENERAL',
  onCerrar,
}: ModalCompraTicketProps) {
  const navigate = useNavigate()
  const comprarMutation = useComprarTicket()
  const [errorServidor, setErrorServidor] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CompraTicketForm>({
    resolver: zodResolver(CompraSchema),
    values: {
      type: tipoInicial,
    },
  })

  function manejarCierre() {
    if (comprarMutation.isPending) return
    setErrorServidor(null)
    onCerrar()
  }

  async function manejarEnvio(datos: CompraTicketForm) {
    setErrorServidor(null)
    try {
      const ticket = await comprarMutation.mutateAsync({
        userEmail,
        eventCode,
        type: datos.type,
      })
      void navigate(RUTAS.confirmacionCompra(ticket.ticketCode))
    } catch (error) {
      if (esApiError(error)) {
        setErrorServidor(error.message)
        return
      }
      setErrorServidor(MENSAJE_ERROR_GENERICO)
    }
  }

  const idFormulario = 'form-compra-ticket'

  return (
    <Modal
      abierto={abierto}
      titulo="Confirmar compra"
      onCerrar={manejarCierre}
      cerrable={!comprarMutation.isPending}
      pie={
        <>
          <Boton
            variante="secundario"
            onClick={manejarCierre}
            disabled={comprarMutation.isPending}
          >
            Cancelar
          </Boton>
          <Boton
            type="submit"
            form={idFormulario}
            cargando={comprarMutation.isPending}
          >
            Confirmar compra
          </Boton>
        </>
      }
    >
      {errorServidor !== null && (
        <Aviso tono="error" titulo="No se pudo completar la compra">
          {errorServidor}
        </Aviso>
      )}

      <div className="border-2 border-slate-900 bg-slate-50 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="font-mono text-xs font-bold uppercase tracking-widest text-slate-600">
            Evento seleccionado
          </span>
          <CodigoTexto codigo={eventCode} />
        </div>
        <p className="mt-1 font-titulo text-lg font-extrabold uppercase text-slate-900">
          {eventName}
        </p>
        <p className="mt-2 font-mono text-xs text-slate-700">
          Titular: <span className="font-bold">{userEmail}</span>
        </p>
      </div>

      <form
        id={idFormulario}
        onSubmit={(e) => void handleSubmit(manejarEnvio)(e)}
        noValidate
        className="flex flex-col gap-4"
      >
        <Selector
          etiqueta="Tipo de ticket"
          opciones={OPCIONES_TIPO_TICKET}
          error={errors.type?.message}
          ayuda="El precio oficial en COP es calculado y asignado por el servidor."
          {...register('type')}
        />
      </form>
    </Modal>
  )
}
