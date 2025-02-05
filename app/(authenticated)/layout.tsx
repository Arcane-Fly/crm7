import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { Toaster } from 'react-hot-toast';
import { Providers } from '@/components/providers';
import { getServerSession } from '@/lib/supabase/utils';

interface AuthenticatedLayoutProps {
  children: ReactNode;
}

export default async function AuthenticatedLayout({
  children,
}: AuthenticatedLayoutProps): Promise<JSX.Element> {
  const session = await getServerSession();
  if (!session) {
    redirect('/login');
  }
  return (
    <>
      <Providers>
        {children}
        <Toaster />
      </Providers>
    </>
  );
}
