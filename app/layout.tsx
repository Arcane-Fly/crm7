import { Inter as FontSans } from 'next/font/google'
import localFont from 'next/font/local'
import { cn } from '@/lib/utils'
import { Providers } from '@/components/providers'
import { ErrorBoundary } from '@/components/error-boundary/ErrorBoundary'
import { initializeMonitoring } from '@/lib/monitoring'
import { logger } from '@/lib/services/logger'
import '@/styles/globals.css'

const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans',
})

const fontMono = localFont({
  src: '../assets/fonts/mono.ttf',
  variable: '--font-mono',
})

// Initialize monitoring
if (typeof window !== 'undefined') {
  initializeMonitoring()
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased',
          fontSans.variable,
          fontMono.variable
        )}
      >
        <ErrorBoundary
          onError={(error, errorInfo) => {
            logger.error('Global error boundary:', error, {
              componentStack: errorInfo.componentStack,
            })
          }}
        >
          <Providers>{children}</Providers>
        </ErrorBoundary>
      </body>
    </html>
  )
}