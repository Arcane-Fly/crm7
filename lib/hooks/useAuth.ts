import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@auth0/nextjs-auth0/client'
import { logger } from '@/lib/logger'
import { AUTH0_ENDPOINTS } from '@/lib/auth0/client'

export type AuthUser = {
  id: string
  email?: string
  name?: string
  avatar_url?: string
  provider: 'supabase' | 'auth0'
}

export function useAuth() {
  const router = useRouter()
  const supabase = createClient()
  const { user: auth0User, error: auth0Error, isLoading: auth0Loading } = useUser()
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || undefined,
          name: session.user.user_metadata?.name || undefined,
          avatar_url: session.user.user_metadata?.avatar_url || undefined,
          provider: 'supabase',
        })
      } else if (auth0User) {
        setUser({
          id: auth0User.sub!,
          email: auth0User.email || undefined,
          name: auth0User.name || undefined,
          avatar_url: auth0User.picture || undefined,
          provider: 'auth0',
        })
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, auth0User])

  useEffect(() => {
    if (auth0Error) {
      logger.error('Auth0 error', { error: auth0Error })
      setError(auth0Error)
    }
  }, [auth0Error])

  const signOut = useCallback(async () => {
    try {
      if (user?.provider === 'supabase') {
        await supabase.auth.signOut()
      } else if (user?.provider === 'auth0') {
        router.push(AUTH0_ENDPOINTS.LOGOUT)
      }
    } catch (error) {
      logger.error('Sign out error', { error })
      setError(error as Error)
    }
  }, [user, supabase, router])

  const signInWithSupabase = useCallback(
    async (provider: 'github' | 'google') => {
      try {
        const { error } = await supabase.auth.signInWithOAuth({
          provider,
          options: {
            redirectTo: `${window.location.origin}/api/auth/callback`,
          },
        })
        if (error) throw error
      } catch (error) {
        logger.error('Supabase sign in error', { error, provider })
        setError(error as Error)
      }
    },
    [supabase]
  )

  const signInWithAuth0 = useCallback(() => {
    router.push(AUTH0_ENDPOINTS.LOGIN)
  }, [router])

  return {
    user,
    loading: loading || auth0Loading,
    error,
    signOut,
    signInWithSupabase,
    signInWithAuth0,
  }
}
