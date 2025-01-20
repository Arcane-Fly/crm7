'use client'

import { UserProvider } from '@auth0/nextjs-auth0/client'
import { headers } from 'next/headers'
import { createClient } from '@/lib/auth/config'

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const headersList = headers()
  const supabase = createClient()

  return (
    <div className='flex min-h-screen items-center justify-center bg-gray-50'>
      <div className='w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-lg'>
        <UserProvider>
          {children}
        </UserProvider>
      </div>
    </div>
  )
}
