'use client'

import type { ErrorInfo, ReactNode } from 'react'
import { Component } from 'react'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo)
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <Alert variant='destructive'>
          <h2 className='text-lg font-semibold'>Something went wrong</h2>
          <div className='mt-2'>
            <p className='text-sm text-gray-500'>
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <Button
              variant='outline'
              className='mt-4'
              onClick={() => this.setState({ hasError: false, error: null })}
            >
              Try again
            </Button>
          </div>
        </Alert>
      )
    }

    return this.props.children
  }
}
