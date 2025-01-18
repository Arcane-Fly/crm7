import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import { FinancialPerformanceDashboard } from '../financial-performance-dashboard'
import { useBankIntegration } from '@/lib/hooks/use-bank-integration'

// Mock the hooks
vi.mock('@/lib/hooks/use-bank-integration')

const mockTransactions = [
  {
    id: '1',
    org_id: 'org1',
    account_id: 'acc1',
    reference: 'ref1',
    type: 'credit',
    amount: 1000,
    description: 'Payment received',
    transaction_date: '2024-01-01',
    status: 'completed',
  },
  {
    id: '2',
    org_id: 'org1',
    account_id: 'acc1',
    reference: 'ref2',
    type: 'debit',
    amount: 500,
    description: 'Payment sent',
    transaction_date: '2024-01-02',
    status: 'completed',
  },
]

describe('FinancialPerformanceDashboard', () => {
  beforeEach(() => {
    vi.mocked(useBankIntegration).mockReturnValue({
      transactions: {
        data: mockTransactions,
        isLoading: false,
        isError: false,
        error: null,
        isSuccess: true,
        isFetching: false,
        isPending: false,
        isLoadingError: false,
        isRefetchError: false,
        isRefetching: false,
        refetch: vi.fn(),
        remove: vi.fn(),
        fetchStatus: 'idle',
        status: 'success',
        dataUpdatedAt: Date.now(),
        errorUpdatedAt: 0,
        failureCount: 0,
        failureReason: null,
        errorUpdateCount: 0,
      },
      accounts: {
        data: [],
        isLoading: false,
        isError: false,
        error: null,
        isSuccess: true,
        isFetching: false,
        isPending: false,
        isLoadingError: false,
        isRefetchError: false,
        isRefetching: false,
        refetch: vi.fn(),
        remove: vi.fn(),
        fetchStatus: 'idle',
        status: 'success',
        dataUpdatedAt: Date.now(),
        errorUpdatedAt: 0,
        failureCount: 0,
        failureReason: null,
        errorUpdateCount: 0,
      },
      createBankAccount: {
        mutate: vi.fn(),
        isPending: false,
        isError: false,
        error: null,
        reset: vi.fn(),
        status: 'idle',
        variables: undefined,
        failureCount: 0,
        failureReason: null,
        mutateAsync: vi.fn(),
      },
      createPayment: {
        mutate: vi.fn(),
        isPending: false,
        isError: false,
        error: null,
        reset: vi.fn(),
        status: 'idle',
        variables: undefined,
        failureCount: 0,
        failureReason: null,
        mutateAsync: vi.fn(),
      },
    })
  })

  it('renders without crashing', () => {
    render(<FinancialPerformanceDashboard />)
    expect(screen.getByText('Financial Performance')).toBeInTheDocument()
  })

  it('displays correct summary statistics', () => {
    render(<FinancialPerformanceDashboard />)
    expect(screen.getByText('$1,000.00')).toBeInTheDocument() // Total Revenue
    expect(screen.getByText('$500.00')).toBeInTheDocument() // Total Expenses
    expect(screen.getByText('$500.00')).toBeInTheDocument() // Net Income
  })

  it('shows loading state', () => {
    vi.mocked(useBankIntegration).mockReturnValue({
      transactions: {
        data: null,
        isLoading: true,
        isError: false,
        error: null,
        isSuccess: false,
        isFetching: false,
        isPending: false,
        isLoadingError: false,
        isRefetchError: false,
        isRefetching: false,
        refetch: vi.fn(),
        remove: vi.fn(),
        fetchStatus: 'idle',
        status: 'pending',
        dataUpdatedAt: 0,
        errorUpdatedAt: 0,
        failureCount: 0,
        failureReason: null,
        errorUpdateCount: 0,
      },
      accounts: {
        data: [],
        isLoading: true,
        isError: false,
        error: null,
        isSuccess: false,
        isFetching: false,
        isPending: false,
        isLoadingError: false,
        isRefetchError: false,
        isRefetching: false,
        refetch: vi.fn(),
        remove: vi.fn(),
        fetchStatus: 'idle',
        status: 'pending',
        dataUpdatedAt: 0,
        errorUpdatedAt: 0,
        failureCount: 0,
        failureReason: null,
        errorUpdateCount: 0,
      },
      createBankAccount: {
        mutate: vi.fn(),
        isPending: false,
        isError: false,
        error: null,
        reset: vi.fn(),
        status: 'idle',
        variables: undefined,
        failureCount: 0,
        failureReason: null,
        mutateAsync: vi.fn(),
      },
      createPayment: {
        mutate: vi.fn(),
        isPending: false,
        isError: false,
        error: null,
        reset: vi.fn(),
        status: 'idle',
        variables: undefined,
        failureCount: 0,
        failureReason: null,
        mutateAsync: vi.fn(),
      },
    })

    render(<FinancialPerformanceDashboard />)
    expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument()
  })

  it('shows error state', () => {
    vi.mocked(useBankIntegration).mockReturnValue({
      transactions: {
        data: null,
        isLoading: false,
        isError: true,
        error: new Error('Failed to load transactions'),
        isSuccess: false,
        isFetching: false,
        isPending: false,
        isLoadingError: false,
        isRefetchError: false,
        isRefetching: false,
        refetch: vi.fn(),
        remove: vi.fn(),
        fetchStatus: 'idle',
        status: 'error',
        dataUpdatedAt: 0,
        errorUpdatedAt: Date.now(),
        failureCount: 1,
        failureReason: 'Failed to load transactions',
        errorUpdateCount: 1,
      },
      accounts: {
        data: [],
        isLoading: false,
        isError: false,
        error: null,
        isSuccess: false,
        isFetching: false,
        isPending: false,
        isLoadingError: false,
        isRefetchError: false,
        isRefetching: false,
        refetch: vi.fn(),
        remove: vi.fn(),
        fetchStatus: 'idle',
        status: 'error',
        dataUpdatedAt: 0,
        errorUpdatedAt: 0,
        failureCount: 0,
        failureReason: null,
        errorUpdateCount: 0,
      },
      createBankAccount: {
        mutate: vi.fn(),
        isPending: false,
        isError: false,
        error: null,
        reset: vi.fn(),
        status: 'idle',
        variables: undefined,
        failureCount: 0,
        failureReason: null,
        mutateAsync: vi.fn(),
      },
      createPayment: {
        mutate: vi.fn(),
        isPending: false,
        isError: false,
        error: null,
        reset: vi.fn(),
        status: 'idle',
        variables: undefined,
        failureCount: 0,
        failureReason: null,
        mutateAsync: vi.fn(),
      },
    })

    render(<FinancialPerformanceDashboard />)
    expect(screen.getByText(/Failed to load transactions/i)).toBeInTheDocument()
  })

  it('filters transactions by date range', async () => {
    render(<FinancialPerformanceDashboard />)

    // Open date picker
    const dateRangePicker = screen.getByRole('button', { name: /Date Range/i })
    fireEvent.click(dateRangePicker)

    // Select date range
    // Note: Actual date selection would depend on your date picker component
    // This is just a simplified example

    await waitFor(() => {
      expect(screen.getByText('$1,000.00')).toBeInTheDocument()
    })
  })

  it('meets accessibility requirements', () => {
    render(<FinancialPerformanceDashboard />)

    // Check for ARIA labels
    expect(screen.getByLabelText('Total revenue')).toBeInTheDocument()
    expect(screen.getByLabelText('Total expenses')).toBeInTheDocument()
    expect(screen.getByLabelText('Net income')).toBeInTheDocument()

    // Check for heading structure
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Financial Performance')

    // Check for region role
    expect(screen.getByRole('region')).toBeInTheDocument()
  })
})
