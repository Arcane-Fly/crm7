import '@/styles/globals.css';

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

import { PerformanceMonitor } from '@/components/monitoring/PerformanceMonitor';
import { Providers } from '@/components/providers';
import { PerformanceProvider } from '@/components/providers/PerformanceProvider';
import { Navbar } from '@/components/ui/navbar';
import { Sidebar } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

const inter = Inter({ subsets: ['latin'] });

// Define the EmitWarningOptions type
type EmitWarningOptions = {
  type?: string;
  code?: string;
  ctor?: Function;
};

// Suppress punycode deprecation warning until dependencies are updated
if (process.emitWarning && typeof process.emitWarning === 'function') {
  const originalEmitWarning = process.emitWarning;
  
  // Define a wrapper that matches Node's process.emitWarning signatures
  const warningWrapper = function(
    warning: string | Error,
    typeOrCtor?: EmitWarningOptions | undefined,
    codeOrCtor?: string | Function,
    ctor?: Function
  ): void {
    // Check if warning is about punycode
    const warningText = warning instanceof Error ? warning.message : warning;
    if (warningText.includes('punycode')) {
      return;
    }

    // Forward the call with all original arguments
    if (arguments.length === 1) {
      originalEmitWarning.call(process, warning);
    } else if (arguments.length === 2) {
      originalEmitWarning.call(process, warning, typeOrCtor);
    } else if (arguments.length === 3) {
      originalEmitWarning.call(process, warning, typeOrCtor, codeOrCtor);
    } else {
      originalEmitWarning.call(process, warning, typeOrCtor, codeOrCtor, ctor);
    }
  };

  process.emitWarning = warningWrapper;
}

export const metadata: Metadata = {
  title: 'CRM System',
  description: 'A modern CRM system built with Next.js',
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <html lang='en'>
      <body className={cn('min-h-screen bg-background antialiased', inter.className)}>
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
      </body>
    </html>
  );
}
