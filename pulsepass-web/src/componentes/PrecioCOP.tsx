import { clsx } from 'clsx'
import { formatearCOP } from '../lib/formato'

export interface PrecioCOPProps {
  valor: number
  className?: string
}

export function PrecioCOP({ valor, className }: PrecioCOPProps) {
  return (
    <span className={clsx('font-mono font-bold tracking-tight', className)}>
      {formatearCOP(valor)}
    </span>
  )
}
