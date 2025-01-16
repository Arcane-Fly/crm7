import { Inter as FontSans, JetBrains_Mono as FontMono } from 'next/font/google'
import { cn } from '@/lib/utils'
import { Providers } from '@/components/providers'
import { ErrorBoundary } from '@/components/error-boundary/ErrorBoundary'
import { initializeMonitoring } from '@/lib/monitoring'
import { logger } from '@/lib/services/logger'
import './globals.css'

const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans',
})

const fontMono = FontMono({
  subsets: ['latin'],
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