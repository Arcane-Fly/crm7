'use client'

import { UserProvider } from '@auth0/nextjs-auth0/client'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className='flex min-h-screen items-center justify-center bg-gray-50'>
      <div className='w-full max-w-md space-y-8 rounded-lg bg-white p-10 shadow-lg'>
        <UserProvider>{children}</UserProvider>
      </div>
    </div>
  )
}
