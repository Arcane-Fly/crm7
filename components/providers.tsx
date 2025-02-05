'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import * as React from 'react';

import { Toaster } from '@/components/ui/toaster';

export function Providers({ children }: { children: React.ReactNode }): JSX.Element {
  const [queryClient] = React.useState(
    (): import("/home/braden/Desktop/Dev/crm7r/node_modules/.pnpm/@tanstack+query-core@5.66.0/node_modules/@tanstack/query-core/build/modern/hydration-De1u5VYH").b =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            gcTime: 5 * 60 * 1000, // 5 minutes
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute='class' defaultTheme='system' enableSystem disableTransitionOnChange>
        {children}
        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
