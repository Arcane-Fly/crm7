import '@/styles/globals.css';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { AppLayout } from '@/components/layout/app-layout';
import { headers } from 'next/headers';
import { createClient } from '@/lib/supabase/server';

const inter = Inter({ subsets: ['latin'] });

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
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
          {session ? (
            <AppLayout>{children}</AppLayout>
          ) : (
            children
          )}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
