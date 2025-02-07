import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/lib/auth/context';
import SupabaseProvider from '@/lib/supabase/supabase-provider';
import '@/styles/globals.css';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { Viewport, type Metadata } from 'next';
import { Inter } from 'next/font/google';
import { cookies } from 'next/headers';
import { type ReactNode } from 'react';

import { PerformanceMonitor } from '@/components/monitoring/PerformanceMonitor';
import { Providers } from '@/components/providers';
import { PerformanceProvider } from '@/components/providers/PerformanceProvider';
import { Navbar } from '@/components/ui/navbar';
import { Sidebar } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

import { ThemeProvider } from '@/components/theme-provider';
import { TooltipProvider } from '@/components/ui/tooltip';

const inter = Inter({ subsets: ['latin'] });

// Suppress punycode deprecation warning until dependencies are updated
const originalEmitWarning = process.emitWarning;
if (originalEmitWarning) {
  process.emitWarning = ((warning: string | Error, ...args: any[]) => {
    const warningText = warning instanceof Error ? warning.message : warning;
    if (warningText.includes('punycode')) {
      return; // Ignore punycode deprecation warnings
    }
    return (originalEmitWarning as (warning: string | Error, ...args: any[]) => void).apply(process, [warning, ...args]);
  }) as typeof process.emitWarning;
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' }
  ]
};

export const metadata: Metadata = {
  title: 'CRM7R',
  description: 'Next-generation CRM platform',
  manifest: '/site.webmanifest',
  icons: {
    icon: [
      {
        url: '/favicon.ico',
        sizes: '32x32',
      },
    ],
    apple: [
      {
        url: '/apple-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  },
};

async function getSession() {
  const cookieStore = cookies();

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            try {
              cookieStore.set(name, value, options);
            } catch (error) {
              console.error('Error setting cookie:', error);
            }
          },
          remove(name: string, options: CookieOptions) {
            try {
              cookieStore.set(name, '', { ...options, maxAge: 0 });
            } catch (error) {
              console.error('Error removing cookie:', error);
            }
          },
        },
      }
    );

    const { data: { session } } = await supabase.auth.getSession();
    return session;
  } catch (error) {
    console.error('Error in getSession:', error);
    return null;
  }
}

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getSession();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={cn('min-h-screen bg-background antialiased', inter.className)}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SupabaseProvider>
            <AuthProvider initialSession={session}>
              <TooltipProvider>
                <PerformanceProvider>
                  <Providers>
                    <div className='relative flex min-h-screen flex-col'>
                      <Navbar />
                      <div className='flex-1 items-start md:grid md:grid-cols-[220px_minmax(0,1fr)] md:gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10'>
                        <aside className='fixed top-14 z-30 -ml-2 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 overflow-y-auto border-r md:sticky md:block'>
                          <Sidebar />
                        </aside>
                        <main className='relative py-6 lg:gap-10 lg:py-8 xl:grid-cols-[1fr_300px]'>
                          <PerformanceMonitor />
                          {children}
                        </main>
                      </div>
                    </div>
                  </Providers>
                </PerformanceProvider>
                <Toaster />
              </TooltipProvider>
            </AuthProvider>
          </SupabaseProvider>
        </ThemeProvider>
        {(process.env.NODE_ENV === "development" || process.env.VERCEL_ENV === "preview") && (
          <script
            defer
            data-recording-token="dIhQ6zTg94bm6TlHhZVrK5pwWfrh7bdeAwRI6VrP"
            data-is-production-environment="false"
            src="https://snippet.meticulous.ai/v1/meticulous.js"
          />
        )}
      </body>
    </html>
  );
}
