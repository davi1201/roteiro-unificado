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
  // isLoading stays true until both the auth session AND the org_members
  // lookup have resolved. Starts as true so ProtectedRoute always waits.
  const [isLoading, setIsLoading] = useState(true)

  // onAuthStateChange MUST remain synchronous — calling supabase.from(...)
  // inside the callback deadlocks the Supabase JS v2 client because the
  // client holds an internal lock for the duration of the auth event.
  // Solution: keep the callback sync (only update session/user state here)
  // and do the org_members fetch in a separate useEffect that watches
  // session?.user?.id, which runs after the auth lock is released.
  useEffect(() => {
    const { data: subscription } = supabase.auth.onAuthStateChange((event, currentSession) => {
      if (event === 'SIGNED_OUT' || !currentSession) {
        setUser(null)
        setSession(null)
        setRole(null)
        setOrgId(null)
        setIsLoading(false)
      } else {
        // SIGNED_IN or INITIAL_SESSION — defer DB call to the effect below
        setUser(currentSession.user)
        setSession(currentSession)
        // isLoading stays true until the org_members effect below settles
      }
    })

    return () => {
      subscription.subscription.unsubscribe()
    }
  }, [])

  // Fetch org membership whenever the authenticated user changes.
  // Runs outside the onAuthStateChange lock, so the supabase client is free.
  useEffect(() => {
    const userId = user?.id
    if (!userId) return

    let cancelled = false

    async function fetchOrgMember() {
      const { data, error } = await supabase
        .from('org_members')
        .select('org_id, role')
        .eq('user_id', userId!)
        .single<{ org_id: string; role: Enums<'member_role'> }>()

      if (cancelled) return

      if (error || !data) {
        setRole(null)
        setOrgId(null)
      } else {
        setRole(data.role)
        setOrgId(data.org_id)
      }
      setIsLoading(false)
    }

    fetchOrgMember()

    return () => {
      cancelled = true
    }
  }, [user?.id])

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
