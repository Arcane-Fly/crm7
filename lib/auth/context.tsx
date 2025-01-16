'use client'

import * as React from 'react'
import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '../supabase/client'
import type { Session, User } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  session: Session | null
  signOut: () => Promise<void>
  requiresMFA: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  signOut: async () => {},
  requiresMFA: false,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [requiresMFA, setRequiresMFA] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)

      if (!session) {
        router.push('/auth')
      } else {
        // Check if user requires MFA
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
  }, [router, supabase.auth])

  const signOut = async () => {
    await supabase.auth.signOut()
    router.push('/auth')
  }

  return (
    <AuthContext.Provider value={{ user, session, signOut, requiresMFA }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
