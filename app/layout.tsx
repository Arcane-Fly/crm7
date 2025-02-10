import { Inter } from 'next/font/google';
import './globals.css';
import { AppLayout } from '@/components/layout/app-layout';
import { AuthProvider } from '@/lib/auth/context';
import { createClient } from '@/utils/supabase/server';
import { ErrorBoundary } from '@/components/error-boundary/ErrorBoundary';
import { Providers } from '@/components/providers';

const inter = Inter({ subsets: ['latin'] });

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): Promise<React.ReactElement> {
  const supabase = await createClient();

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    return (
      <html lang="en" suppressHydrationWarning>
        <head>
          <title>Labour Hire CRM</title>
          <meta name="description" content="A modern CRM for labour hire companies" />
        </head>
        <body className={inter.className}>
          <Providers>
            <ErrorBoundary>
              <AuthProvider initialSession={session}>
                {session ? <AppLayout>{children}</AppLayout> : children}
              </AuthProvider>
            </ErrorBoundary>
          </Providers>
        </body>
      </html>
    );
  } catch (error) {
    console.error('Error getting session:', error);
    return (
      <html lang="en" suppressHydrationWarning>
        <head>
          <title>Labour Hire CRM - Error</title>
        </head>
        <body className={inter.className}>
          <Providers>
            <ErrorBoundary>
              <div className="flex min-h-screen flex-col items-center justify-center p-4">
                <h1 className="text-2xl font-bold text-red-500">Error</h1>
                <p className="mt-2 text-gray-600">
                  An error occurred while loading the application. Please try again later.
                </p>
              </div>
            </ErrorBoundary>
          </Providers>
        </body>
      </html>
    );
  }
}
