import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { AppLayout } from '@/components/layout/app-layout';
import { AuthProvider } from '@/lib/auth/context';
import { createClient } from '@/utils/supabase/server';
import { ErrorBoundary } from '@/components/error-boundary/ErrorBoundary';

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
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <ErrorBoundary>
              <AuthProvider initialSession={session}>
                {session ? <AppLayout>{children}</AppLayout> : children}
                <Toaster />
              </AuthProvider>
            </ErrorBoundary>
          </ThemeProvider>
        </body>
      </html>
    );
  } catch (error) {
    console.error('Error getting session:', error);
    return (
      <html lang="en" suppressHydrationWarning>
        <head>
          <title>Labour Hire CRM</title>
          <meta name="description" content="A modern CRM for labour hire companies" />
        </head>
        <body className={inter.className}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <ErrorBoundary>
              <AuthProvider initialSession={null}>
                {children}
                <Toaster />
              </AuthProvider>
            </ErrorBoundary>
          </ThemeProvider>
        </body>
      </html>
    );
  }
}
