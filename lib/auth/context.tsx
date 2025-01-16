'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '../supabase/client'
import type { Session, User } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  session: Session | null
  signOut: () => Promise<void>
  requiresMFA: boolean
}

const AuthContext = React.createContext<AuthContextType>({
  user: null,
  session: null,
  signOut: async () => {},
  requiresMFA: false,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null)
  const [session, setSession] = React.useState<Session | null>(null)
  const [requiresMFA, setRequiresMFA] = React.useState(false)
  const router = useRouter()
  const supabase = React.useMemo(() => createClient(), [])

  React.useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)

      if (!session) {
        router.push('/auth')
      } else {
        const { data, error } = await supabase
          .from('user_mfa')
          .select('enabled, verified')
          .eq('user_id', session.user.id)
          .single()

        if (!error && data) {
          setRequiresMFA(data.enabled && !data.verified)
          if (data.enabled && !data.verified) {
            router.push('/auth/mfa')
          }
        }
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router, supabase])

  const signOut = React.useCallback(async () => {
    await supabase.auth.signOut()
    router.push('/auth')
  }, [router, supabase])

  return (
    <AuthContext.Provider value={{ user, session, signOut, requiresMFA }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = React.useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
