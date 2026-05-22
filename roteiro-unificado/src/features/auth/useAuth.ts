import { useContext } from 'react'
import { AuthContext } from './AuthProvider'
import type { AuthContextType } from './AuthProvider'

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === null) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider')
  }
  return context
}
