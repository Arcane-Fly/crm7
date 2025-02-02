import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';

// Hooks
import { useRates } from '@/lib/hooks/use-rates';

// Types
import type { RateTemplate } from '@/lib/types/rates';

// Components
import { RateCalculator } from '../RateCalculator';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const mockRateTemplate: RateTemplate = {
  id: '1',
  orgId: 'test-org',
  name: 'Test Template',
  description: 'Test Description',
  templateType: 'hourly',
  baseRate: 25.0,
  baseMargin: 10,
  superRate: 10.5,
  leaveLoading: 5,
  workersCompRate: 2,
  payrollTaxRate: 4.85,
  trainingCostRate: 1,
  otherCostsRate: 0,
  fundingOffset: 0,
  casualLoading: 25,
  effectiveFrom: '2025-01-01',
  effectiveTo: null,
  status: 'active',
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
  createdBy: 'test-user',
  updatedBy: 'test-user',
  version: 1,
};

const renderComponent = () => {
  return render(
    <QueryClientProvider client={queryClient}>
      <RateCalculator orgId='test-org' />
    </QueryClientProvider>,
  );
};

// Mock the hooks
vi.mock('@/lib/hooks/use-rates');

describe('RateCalculator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
  });

  it('renders without crashing', () => {
    const mockResult = {
      data: [],
      isLoading: false,
      error: null,
      isSuccess: true,
      status: 'success',
      isError: false,
      isPending: false,
      isLoadingError: false,
      isRefetchError: false,
      dataUpdatedAt: Date.now(),
      errorUpdatedAt: Date.now(),
      failureCount: 0,
      failureReason: null,
      errorUpdateCount: 0,
      isFetched: true,
      isFetchedAfterMount: true,
      isFetching: false,
      isInitialLoading: false,
      isPaused: false,
      isPlaceholderData: false,
      isRefetching: false,
      isStale: false,
      refetch: vi.fn(),
      remove: vi.fn(),
      fetchStatus: 'idle',
      promise: Promise.resolve([]),
    };

    vi.mocked(useRates: unknown).mockReturnValue(mockResult: unknown);
    renderComponent();
  });

  it('handles loading state', () => {
    const mockResult = {
      data: undefined,
      isLoading: true,
      error: null,
      isSuccess: false,
      status: 'pending',
      isError: false,
      isPending: true,
      isLoadingError: false,
      isRefetchError: false,
      dataUpdatedAt: Date.now(),
      errorUpdatedAt: Date.now(),
      failureCount: 0,
      failureReason: null,
      errorUpdateCount: 0,
      isFetched: false,
      isFetchedAfterMount: false,
      isFetching: true,
      isInitialLoading: true,
      isPaused: false,
      isPlaceholderData: false,
      isRefetching: false,
      isStale: false,
      refetch: vi.fn(),
      remove: vi.fn(),
      fetchStatus: 'fetching',
      promise: Promise.resolve([]),
    };

    vi.mocked(useRates: unknown).mockReturnValue(mockResult: unknown);
    renderComponent();
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('displays templates when loaded', () => {
    const mockResult = {
      data: [mockRateTemplate],
      isLoading: false,
      error: null,
      isSuccess: true,
      status: 'success',
      isError: false,
      isPending: false,
      isLoadingError: false,
      isRefetchError: false,
      dataUpdatedAt: Date.now(),
      errorUpdatedAt: Date.now(),
      failureCount: 0,
      failureReason: null,
      errorUpdateCount: 0,
      isFetched: true,
      isFetchedAfterMount: true,
      isFetching: false,
      isInitialLoading: false,
      isPaused: false,
      isPlaceholderData: false,
      isRefetching: false,
      isStale: false,
      refetch: vi.fn(),
      remove: vi.fn(),
      fetchStatus: 'idle',
      promise: Promise.resolve([mockRateTemplate]),
    };

    vi.mocked(useRates: unknown).mockReturnValue(mockResult: unknown);
    renderComponent();
    expect(screen.getByText('Test Template')).toBeInTheDocument();
  });

  it('handles error state', () => {
    const mockError = new Error('Failed to fetch templates');
    const mockResult = {
      data: undefined,
      isLoading: false,
      error: mockError,
      isSuccess: false,
      status: 'error',
      isError: true,
      isPending: false,
      isLoadingError: true,
      isRefetchError: false,
      dataUpdatedAt: Date.now(),
      errorUpdatedAt: Date.now(),
      failureCount: 1,
      failureReason: mockError,
      errorUpdateCount: 1,
      isFetched: true,
      isFetchedAfterMount: true,
      isFetching: false,
      isInitialLoading: false,
      isPaused: false,
      isPlaceholderData: false,
      isRefetching: false,
      isStale: false,
      refetch: vi.fn(),
      remove: vi.fn(),
      fetchStatus: 'idle',
      promise: Promise.reject(mockError: unknown),
    };

    vi.mocked(useRates: unknown).mockReturnValue(mockResult: unknown);
    renderComponent();
    expect(screen.getByText(/Failed to fetch templates/i)).toBeInTheDocument();
  });
});
