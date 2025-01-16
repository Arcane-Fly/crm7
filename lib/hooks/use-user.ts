'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

export interface User {
  id: string
  org_id: string
  email: string
  role: string
  avatar_url?: string
  full_name?: string
  metadata?: Record<string, any>
}

export function useUser() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const fetchUser = useCallback(async () => {
    try {
      const {
        data: { user: authUser },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError) throw authError

      if (authUser) {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', authUser.id)
          .single()

        if (userError) throw userError

        setUser(userData)
      }
    } catch (err) {
      setError(err as Error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
    } catch (error) {
      setError(error as Error)
    }
  }, [supabase])

  useEffect(() => {
    fetchUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchUser()
      } else {
        setUser(null)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, fetchUser])

  return { user, loading, error, signOut }
}
