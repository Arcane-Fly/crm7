// Core imports
import { type ReactNode, type ReactElement } from 'react';

// Next imports
import { redirect } from 'next/navigation';

// Components
import { Toaster } from 'react-hot-toast';

// App imports
import { Providers } from '@/app/providers';

// Utils
import { getSession } from '@/lib/supabase/utils';

/**
 * Interface for the AuthenticatedLayout component props.
 */
interface AuthenticatedLayoutProps {
  children: ReactNode;
}

/**
 * Renders an authenticated layout, providing a sidebar and header using the Supabase session.
 */
export default async function AuthenticatedLayout({ children }: AuthenticatedLayoutProps): Promise<ReactElement> {
  const session = await getSession();

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
