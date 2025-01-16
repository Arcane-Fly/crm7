import * as React from 'react'
import { ErrorBoundary } from './ErrorBoundary'

export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  componentName: string
) {
  return function WithErrorBoundary(props: P) {
    return (
      <ErrorBoundary>
        <Component {...props} />
      </ErrorBoundary>
    )
  }
}
