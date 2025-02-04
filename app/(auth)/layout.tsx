'use client';

import { UserProvider } from '@auth0/nextjs-auth0/client';
import React from 'react';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps): JSX.Element {
  return (
    <div className='flex min-h-screen flex-col items-center justify-center'>
      <div className='w-full max-w-md space-y-8 rounded-lg bg-white p-10 shadow-lg'>
        <UserProvider>{children}</UserProvider>
      </div>
    </div>
  );
}
