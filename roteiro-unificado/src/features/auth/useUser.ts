import { useAuth } from './useAuth'

export interface UserProfile {
  id: string
  email: string | undefined
}

/**
 * Hook de alto nível que re-expõe os dados do usuário autenticado
 * como abstração nomeada sobre o AuthContext.
 *
 * Todos os componentes que precisam de dados do usuário logado devem
 * consumir este hook ao invés de useAuth() diretamente.
 */
export function useUser() {
  const { user, role, orgId, isLoading, signOut } = useAuth()

  const profile: UserProfile | null = user ? { id: user.id, email: user.email } : null

  return {
    profile,
    role,
    orgId,
    isAdmin: role === 'admin',
    isLoading,
    signOut,
  }
}
