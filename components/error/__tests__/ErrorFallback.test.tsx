import { render, screen, fireEvent } from '@testing-library/react'
import { ErrorFallback } from '../ErrorFallback'

describe('ErrorFallback', () => {
  const mockResetErrorBoundary = jest.fn()
  const mockError = new Error('Test error message')

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders error message correctly', () => {
    render(<ErrorFallback error={mockError} resetErrorBoundary={mockResetErrorBoundary} />)

    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    expect(screen.getByText('Test error message')).toBeInTheDocument()
  })

  it('renders default error message when no error message provided', () => {
    render(<ErrorFallback error={new Error()} resetErrorBoundary={mockResetErrorBoundary} />)

    expect(screen.getByText('An unexpected error occurred. Please try again.')).toBeInTheDocument()
  })

  it('calls resetErrorBoundary when try again button is clicked', () => {
    render(<ErrorFallback error={mockError} resetErrorBoundary={mockResetErrorBoundary} />)

    fireEvent.click(screen.getByText('Try again'))
    expect(mockResetErrorBoundary).toHaveBeenCalledTimes(1)
  })

  it('has correct ARIA attributes', () => {
    render(<ErrorFallback error={mockError} resetErrorBoundary={mockResetErrorBoundary} />)

    expect(screen.getByRole('alert')).toBeInTheDocument()
  })
})
