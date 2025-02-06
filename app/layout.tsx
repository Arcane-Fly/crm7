import '@/styles/globals.css';

import { Inter } from 'next/font/google';

import { PerformanceMonitor } from '@/components/monitoring/PerformanceMonitor';
import { Providers } from '@/components/providers';
import { PerformanceProvider } from '@/components/providers/PerformanceProvider';
import { Navbar } from '@/components/ui/navbar';
import { Sidebar } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/theme-provider';
import { TooltipProvider } from '@/components/ui/tooltip';
import { SupabaseProvider } from '@/lib/supabase/supabase-provider';
import { AuthProvider } from '@/lib/auth/context';

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

export const metadata = {
  title: 'CRM7',
  description: 'Modern CRM for modern businesses',
  viewport: 'width=device-width, initial-scale=1',
  icons: {
    icon: [
      {
        url: '/favicon.ico',
        sizes: 'any',
      },
      {
        url: '/icon.png',
        type: 'image/png',
        sizes: '32x32',
      },
      {
        url: '/icon.png',
        type: 'image/png',
        sizes: '192x192',
      },
      {
        url: '/icon.png',
        type: 'image/png',
        sizes: '512x512',
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

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {(process.env.NODE_ENV === "development" || process.env.VERCEL_ENV === "preview") && (
          // eslint-disable-next-line @next/next/no-sync-scripts
          <script
            data-recording-token="dIhQ6zTg94bm6TlHhZVrK5pwWfrh7bdeAwRI6VrP"
            data-is-production-environment="false"
            src="https://snippet.meticulous.ai/v1/meticulous.js"
          />
        )}
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
            <AuthProvider>
              <TooltipProvider>
                <PerformanceProvider>
                  <Providers>
                    <div className='relative flex min-h-screen flex-col'>
                      <Navbar />
                      <div className='flex-1 items-start md:grid md:grid-cols-[220px_minmax(0: unknown,1fr)] md:gap-6 lg:grid-cols-[240px_minmax(0: unknown,1fr)] lg:gap-10'>
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
      </body>
    </html>
  );
}
