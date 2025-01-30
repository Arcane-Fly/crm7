// Core imports
import { redirect } from 'next/navigation';
import type { ReactNode, ReactElement } from 'react';
// Components
import { Toaster } from 'react-hot-toast';

import { Providers } from '@/components/providers';
// Utils
import { getServerSession } from '@/lib/supabase/utils';

/**
 * Interface for the AuthenticatedLayout component props.
 */
interface AuthenticatedLayoutProps {
  children: ReactNode;
}

/**
 * Renders an authenticated layout, providing a sidebar and header using the Supabase session.
 */
export default async function AuthenticatedLayout({
  children,
}: AuthenticatedLayoutProps): Promise<ReactElement> {
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
