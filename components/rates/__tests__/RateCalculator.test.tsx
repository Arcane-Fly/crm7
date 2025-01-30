import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';

import { RateCalculator } from '../RateCalculator';

// Mock the hooks
vi.mock('@/lib/hooks/use-rates', () => ({
  useRates: () => ({
    templates: [],
    isLoading: false,
    error: null,
  }),
}));

describe('RateCalculator', () => {
  it('renders correctly', () => {
    render(
      <RateCalculator orgId="test-org" />,
    );

    expect(screen.getByText(/Rate Calculator/i)).toBeInTheDocument();
  });

  it('handles loading state', () => {
    const useRates = vi.spyOn(require('@/lib/hooks/use-rates'), 'useRates');
    useRates.mockReturnValue({
      templates: [],
      isLoading: true,
      error: null,
    });

    render(
      <RateCalculator orgId="test-org" />,
    );

    expect(screen.getByText(/Loading/i)).toBeInTheDocument();
  });
});
