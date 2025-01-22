import { useEffect, useState } from 'react'
import { useSupabase } from '../supabase/supabase-provider'
import type { User } from '@supabase/supabase-js'
import { AuthenticationError } from '../types/errors'

interface UseUserReturn {
  user: User | null
  loading: boolean
  error: Error | null
}

export const useUser = (): UseUserReturn => {
  const { supabase } = useSupabase()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const getUser = async () => {
      try {
        const {
          data: { user },
          error: supabaseError,
        } = await supabase.auth.getUser()
        if (supabaseError) {
          throw new AuthenticationError('Failed to get user', supabaseError)
        }
        setUser(user)
        setError(null)
      } catch (error) {
        console.error('Error getting user:', error)
        setUser(null)
        setError(error instanceof Error ? error : new Error('Unknown error occurred'))
      } finally {
        setLoading(false)
      }
    }

    getUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setError(null)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  return { user, loading, error }
}
