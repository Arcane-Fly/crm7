import * as React from 'react'
import { ErrorBoundary } from './ErrorBoundary'
import { logger } from '@/lib/services/logger'

export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  options: {
    fallback?: React.ReactNode
    onError?: (error: Error, errorInfo: React.ErrorInfo) => void
  } = {}
) {
  const displayName = Component.displayName || Component.name || 'Component'

  function WithErrorBoundary(props: P) {
    return (
      <ErrorBoundary
        fallback={options.fallback}
        onError={(error, errorInfo) => {
          logger.error(`Error in ${displayName}:`, error, {
            componentStack: errorInfo.componentStack,
          })
          options.onError?.(error, errorInfo)
        }}
      >
        <Component {...props} />
      </ErrorBoundary>
    )
  }

  WithErrorBoundary.displayName = `withErrorBoundary(${displayName})`
  return WithErrorBoundary
}
