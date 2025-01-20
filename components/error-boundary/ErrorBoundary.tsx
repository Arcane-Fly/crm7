import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertTriangle } from 'lucide-react'
import { logger } from '@/lib/services/logger'

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to monitoring service
    logger.error('Error caught by boundary:', error, {
      componentStack: errorInfo.componentStack,
    })

    // Call onError prop if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className='flex min-h-[400px] items-center justify-center p-6'>
          <Alert variant='destructive' className='max-w-xl'>
            <AlertTriangle className='h-4 w-4' />
            <AlertTitle>Something went wrong</AlertTitle>
            <AlertDescription className='mt-2'>
              <p className='mb-4'>
                An error occurred while rendering this component.
                {this.state.error && (
                  <span className='mt-2 block text-sm opacity-80'>{this.state.error.message}</span>
                )}
              </p>
              <Button
                variant='outline'
                onClick={() => {
                  this.setState({ hasError: false, error: null })
                  window.location.reload()
                }}
              >
                Try again
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      )
    }

    return this.props.children
  }
}
