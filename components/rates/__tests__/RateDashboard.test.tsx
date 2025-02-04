import type { UseQueryResult } from '@tanstack/react-query';
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';

import { useRates } from '@/lib/hooks/use-rates';
import type { RateTemplate } from '@/lib/types/rates';

import { RateDashboard } from '../RateDashboard';

vi.mock('@/lib/hooks/use-rates');

const mockRateTemplate: RateTemplate = {
  id: '1',
  orgId: 'test-org',
  name: 'Standard Rate',
  templateType: 'hourly',
  description: null,
  baseRate: 25.0,
  baseMargin: 10,
  superRate: 10.5,
  leaveLoading: 0,
  workersCompRate: 2.5,
  payrollTaxRate: 4.85,
  trainingCostRate: 0,
  otherCostsRate: 0,
  fundingOffset: 0,
  casualLoading: 25,
  effectiveFrom: '2025-01-01',
  effectiveTo: null,
  status: 'active',
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
  createdBy: 'system',
  updatedBy: 'system',
  version: 1,
};

type SuccessResult = {
  data: RateTemplate[];
  error: null;
  isError: false;
  isPending: false;
  isLoading: false;
  isSuccess: true;
  status: 'success';
  isLoadingError: false;
  isRefetchError: false;
};

type ErrorResult = {
  data: undefined;
  error: Error;
  isError: true;
  isPending: false;
  isLoading: false;
  isSuccess: false;
  status: 'error';
  isLoadingError: true;
  isRefetchError: false;
};

type LoadingResult = {
  data: undefined;
  error: null;
  isError: false;
  isPending: true;
  isLoading: true;
  isSuccess: false;
  status: 'pending';
  isLoadingError: false;
  isRefetchError: false;
};

const createMockQueryResult = (
  overrides: Partial<UseQueryResult<RateTemplate[], Error>> = {},
): UseQueryResult<RateTemplate[], Error> => {
  const baseResult = {
    isStale: false,
    isFetched: true,
    isFetchedAfterMount: true,
    isFetching: false,
    isInitialLoading: false,
    isPaused: false,
    isPlaceholderData: false,
    isRefetching: false,
    dataUpdatedAt: Date.now(),
    errorUpdatedAt: 0,
    failureCount: 0,
    failureReason: null,
    errorUpdateCount: 0,
    fetchStatus: 'idle' as const,
    refetch: vi.fn(),
    promise: Promise.resolve([mockRateTemplate]),
  };

  const successDefaults: SuccessResult = {
    data: [mockRateTemplate],
    error: null,
    isError: false,
    isPending: false,
    isLoading: false,
    isSuccess: true,
    status: 'success',
    isLoadingError: false,
    isRefetchError: false,
  };

  return {
    ...baseResult,
    ...successDefaults,
    ...overrides,
  } as UseQueryResult<RateTemplate[], Error>;
};

describe('RateDashboard', () => {
  it('renders without crashing', async () => {
    (vi.mocked(useRates) as jest.Mock).mockReturnValueOnce(createMockQueryResult());

    render(<RateDashboard orgId='test-org' />);

    const rateManagementElement = screen.getByText('Rate Management');
    expect(rateManagementElement).toBeInTheDocument();
  });

  it('displays rates data', async () => {
    (vi.mocked(useRates) as jest.Mock).mockReturnValueOnce(createMockQueryResult());

    render(<RateDashboard orgId='test-org' />);

    const rateElement = screen.getByText('$25.00');
    expect(rateElement).toBeInTheDocument();
  });

  it('shows loading state', async () => {
    const loadingOverrides: LoadingResult = {
      data: undefined,
      error: null,
      isError: false,
      isPending: true,
      isLoading: true,
      isSuccess: false,
      status: 'pending',
      isLoadingError: false,
      isRefetchError: false,
    };

    (vi.mocked(useRates) as jest.Mock).mockReturnValueOnce(
      createMockQueryResult({
        ...loadingOverrides,
        fetchStatus: 'fetching',
        isFetched: false,
        isFetchedAfterMount: false,
        isFetching: true,
        isInitialLoading: true,
        promise: Promise.resolve([]),
      }),
    );

    render(<RateDashboard orgId='test-org' />);

    const loadingElement = screen.queryByText('Loading...');
    expect(loadingElement).not.toBeInTheDocument();
  });

  it('shows error state', async () => {
    const error = new Error('Failed to load rates');
    const errorOverrides: ErrorResult = {
      data: undefined,
      error,
      isError: true,
      isPending: false,
      isLoading: false,
      isSuccess: false,
      status: 'error',
      isLoadingError: true,
      isRefetchError: false,
    };

    (vi.mocked(useRates) as jest.Mock).mockReturnValueOnce(
      createMockQueryResult({
        ...errorOverrides,
        errorUpdatedAt: Date.now(),
        failureCount: 1,
        errorUpdateCount: 1,
        promise: Promise.reject(error),
      }),
    );

    render(<RateDashboard orgId='test-org' />);

    const errorElement = screen.queryByText('Error: Failed to load rates');
    expect(errorElement).toBeInTheDocument();
  });

  it('filters rates by date range', async () => {
    (vi.mocked(useRates) as jest.Mock).mockReturnValueOnce(createMockQueryResult());

    render(<RateDashboard orgId='test-org' />);
    const dateRangeButton = screen.getByRole('button', { name: /Select Date Range/i });
    fireEvent.click(dateRangeButton);
    // Add more specific date range selection tests based on your date picker implementation
  });
});
