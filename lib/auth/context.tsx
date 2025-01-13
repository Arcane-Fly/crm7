'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '../supabase/client'
import { Session, User } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  session: Session | null
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  signOut: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)

      if (!session) {
        router.push('/auth')
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
    <AuthContext.Provider value={{ user, session, signOut }}>
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
