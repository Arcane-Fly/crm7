import React from 'react';
import { ErrorBoundary } from './ErrorBoundary';

interface WithErrorBoundaryOptions {
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  fallback?: React.ReactNode;
}

export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  options: WithErrorBoundaryOptions = {}
): React.ComponentType<P> {
  return function WithErrorBoundary(props: P): React.ReactElement {
    return (
      <ErrorBoundary
        onError={(error, errorInfo) => {
          options.onError?.(error, errorInfo);
        }}
        fallback={options.fallback}
      >
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}
