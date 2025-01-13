'use client'

import { Auth as SupabaseAuth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { createClientSupabaseClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/use-toast'

export default function AuthPage() {
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClientSupabaseClient()

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession()
      if (currentSession) {
        router.push('/')
      }
    }
    
    checkSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event) => {
        if (event === 'SIGNED_IN') {
          router.push('/')
        }
        if (event === 'SIGNED_OUT') {
          router.push('/auth')
        }
        if (event === 'USER_UPDATED') {
          const { error } = await supabase.auth.getSession()
          if (error) {
            toast({
              variant: 'destructive',
              title: 'Authentication Error',
              description: error.message,
            })
          }
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [router, toast, supabase.auth])

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-md w-full space-y-8'>
        <div>
          <h1 className='text-center text-3xl font-bold text-primary'>
            WorkforceHub
          </h1>
          <h2 className='mt-6 text-center text-2xl font-bold text-gray-900'>
            Sign in to your account
          </h2>
        </div>
        <SupabaseAuth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          providers={['google', 'github']}
          theme='light'
          redirectTo={`${window.location.origin}/auth/callback`}
        />
      </div>
    </div>
  )
}
