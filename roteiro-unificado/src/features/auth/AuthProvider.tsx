import { createContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import type { Enums } from '@/types/database'

export interface AuthContextType {
  user: User | null
  session: Session | null
  role: Enums<'member_role'> | null
  orgId: string | null
  isLoading: boolean
  signOut: () => Promise<void>
}

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextType | null>(null)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [role, setRole] = useState<Enums<'member_role'> | null>(null)
  const [orgId, setOrgId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  async function fetchOrgMember(userId: string) {
    const { data, error } = await supabase
      .from('org_members')
      .select('org_id, role')
      .eq('user_id', userId)
      .single<{ org_id: string; role: Enums<'member_role'> }>()

    if (error || !data) {
      setRole(null)
      setOrgId(null)
    } else {
      setRole(data.role)
      setOrgId(data.org_id)
    }
  }

  useEffect(() => {
    const { data: subscription } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        if (event === 'SIGNED_OUT' || !currentSession) {
          setUser(null)
          setSession(null)
          setRole(null)
          setOrgId(null)
        } else {
          // SIGNED_IN or INITIAL_SESSION
          setUser(currentSession.user)
          setSession(currentSession)
          await fetchOrgMember(currentSession.user.id)
        }
        setIsLoading(false)
      }
    )

    return () => {
      subscription.subscription.unsubscribe()
    }
  }, [])

  async function signOut() {
    await supabase.auth.signOut()
    // Redirect to /login is the Router's responsibility (plan 06)
  }

  return (
    <AuthContext.Provider value={{ user, session, role, orgId, isLoading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}
