import { render, screen } from '@testing-library/react';

import { SkeletonLoader } from '../SkeletonLoader';

describe('SkeletonLoader', () => {
  it('renders with default number of lines', () => {
    render(<SkeletonLoader />);
    const loader = screen.getByRole('status');
    expect(loader).toBeInTheDocument();
  });

  it('renders with custom number of lines', () => {
    render(<SkeletonLoader lines={5} />);
    const loader = screen.getByRole('status');
    expect(loader).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<SkeletonLoader className='test-class' />);
    const loader = screen.getByRole('status');
    expect(loader).toHaveClass('test-class');
  });

  it('applies custom lineClassName', () => {
    render(<SkeletonLoader lineClassName='line-test-class' />);
    const loader = screen.getByRole('status');
    expect(loader).toHaveClass('line-test-class');
  });

  it('has correct ARIA attributes', () => {
    render(<SkeletonLoader />);
    const loader = screen.getByRole('status');
    expect(loader).toHaveAttribute('aria-label', 'Loading content');
    expect(screen.getByText('Loading...')).toHaveClass('sr-only');
  });
});
