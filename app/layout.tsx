import '@/styles/globals.css';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { AppLayout } from '@/components/layout/app-layout';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { AuthProvider } from '@/lib/auth/context';

const inter = Inter({ subsets: ['latin'] });

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          cookieStore.set({ name, value: '', ...options, maxAge: 0 });
        },
      },
    }
  );

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
            <AuthProvider initialSession={session}>
              {session ? (
                <AppLayout>{children}</AppLayout>
              ) : (
                children
              )}
              <Toaster />
            </AuthProvider>
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
            <AuthProvider initialSession={null}>
              {children}
              <Toaster />
            </AuthProvider>
          </ThemeProvider>
        </body>
      </html>
    );
  }
}
