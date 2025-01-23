import { render, screen } from '@testing-library/react'
import { LoadingSpinner } from '../LoadingSpinner'

describe('LoadingSpinner', () => {
  it('renders with default size', () => {
    render(<LoadingSpinner />)
    const spinner = screen.getByRole('status')
    expect(spinner).toBeInTheDocument()
  })

  it('renders with different sizes', () => {
    const { rerender } = render(<LoadingSpinner size='sm' />)
    const smallSpinner = screen.getByRole('status')
    expect(smallSpinner).toBeInTheDocument()

    rerender(<LoadingSpinner size='lg' />)
    const largeSpinner = screen.getByRole('status')
    expect(largeSpinner).toBeInTheDocument()
  })

  it('applies custom className', () => {
    render(<LoadingSpinner className='test-class' />)
    const spinner = screen.getByRole('status')
    expect(spinner).toHaveClass('test-class')
  })

  it('has correct ARIA attributes', () => {
    render(<LoadingSpinner />)
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Loading')
    expect(screen.getByText('Loading...')).toHaveClass('sr-only')
  })
})
