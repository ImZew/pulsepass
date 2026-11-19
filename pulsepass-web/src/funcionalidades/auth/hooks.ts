import { useContext } from 'react'
import { AuthContext, type AuthContextValue } from './contexto'

export function useAuth(): AuthContextValue {
  const contexto = useContext(AuthContext)
  if (contexto === null) {
    throw new Error('useAuth debe utilizarse dentro de un AuthProvider')
  }
  return contexto
}
