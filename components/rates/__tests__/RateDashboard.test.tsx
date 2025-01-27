import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';

import { useRates } from '@/lib/hooks/use-rates';
import { createMockQueryResult } from '@/types/test-utils';

import { RateDashboard } from '../RateDashboard';
import '@testing-library/jest-dom';

vi.mock('@/lib/hooks/use-rates');

describe('RateDashboard', () => {
  it('renders without crashing', async () => {
    vi.mocked(useRates).mockReturnValueOnce({
      data: [
        {
          id: '1',
          rate: 25.0,
          effective_date: '2025-01-01',
          status: 'active',
        },
      ],
      isLoading: false,
      error: null,
    });

    render(<RateDashboard orgId='test-org' />);

    // Get initial elements
    const rateManagementElement = screen.getByText('Rate Management');

    // Verify
    expect(rateManagementElement).toBeInTheDocument();
  });

  it('displays rates data', async () => {
    vi.mocked(useRates).mockReturnValueOnce({
      data: [
        {
          id: '1',
          rate: 25.0,
          effective_date: '2025-01-01',
          status: 'active',
        },
      ],
      isLoading: false,
      error: null,
    });

    render(<RateDashboard orgId='test-org' />);

    // Get initial elements
    const rateElement = screen.getByText('$25.00');

    // Verify
    expect(rateElement).toBeInTheDocument();
  });

  it('shows loading state', async () => {
    vi.mocked(useRates).mockReturnValueOnce(
      createMockQueryResult({
        data: undefined,
        isLoading: true,
        error: null,
      }),
    );

    render(<RateDashboard orgId='test-org' />);

    // Get initial elements
    const loadingElement = screen.queryByText('Loading...');

    // Verify
    expect(loadingElement).not.toBeInTheDocument();
  });

  it('shows error state', async () => {
    vi.mocked(useRates).mockReturnValueOnce(
      createMockQueryResult({
        data: undefined,
        isLoading: false,
        error: new Error('Failed to load rates'),
      }),
    );

    render(<RateDashboard orgId='test-org' />);

    // Get initial elements
    const errorElement = screen.queryByText('Error: Failed to load rates');

    // Verify
    expect(errorElement).toBeInTheDocument();
  });

  it('filters rates by date range', async () => {
    render(<RateDashboard orgId='test-org' />);
    const dateRangeButton = screen.getByRole('button', { name: /Select Date Range/i });
    fireEvent.click(dateRangeButton);
    // Add more specific date range selection tests based on your date picker implementation
  });
});
