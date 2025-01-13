'use client'

import { createClient } from '@/lib/supabase/client'
import { FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useToast } from '@/components/ui/use-toast'

export default function AuthPage() {
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

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

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw error
      }

      // Redirect will be handled by middleware
    } catch (error) {
      console.error('Authentication error:', error)
    }
  }

  return (
    <div className='container flex h-screen w-screen flex-col items-center justify-center'>
      <div className='mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]'>
        <div className='flex flex-col space-y-2 text-center'>
          <h1 className='text-2xl font-semibold tracking-tight'>
            Welcome back
          </h1>
          <p className='text-sm text-muted-foreground'>
            Enter your credentials to continue
          </p>
        </div>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='space-y-2'>
            <label
              htmlFor='email'
              className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
            >
              Email
            </label>
            <input
              id='email'
              name='email'
              type='email'
              placeholder='m@example.com'
              className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
            />
          </div>
          <div className='space-y-2'>
            <label
              htmlFor='password'
              className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
            >
              Password
            </label>
            <input
              id='password'
              name='password'
              type='password'
              className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
            />
          </div>
          <button
            type='submit'
            className='inline-flex h-10 w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50'
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  )
}
