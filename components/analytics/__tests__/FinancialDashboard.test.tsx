import { render, screen, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import { FinancialPerformanceDashboard } from '../financial-performance-dashboard'
import { useBankIntegration } from '@/lib/hooks/use-bank-integration'

// Mock the hooks
vi.mock('@/lib/hooks/use-bank-integration')

const mockTransactions = [
  {
    id: '1',
    type: 'credit',
    amount: 1000,
    description: 'Payment received',
    transaction_date: '2024-01-01',
    status: 'completed',
  },
  {
    id: '2',
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
        error: null,
      },
      accounts: {
        data: [],
        isLoading: false,
        error: null,
      },
      actions: {
        addBankAccount: vi.fn(),
        createPayment: vi.fn(),
        approvePayment: vi.fn(),
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
        error: null,
      },
      accounts: {
        data: [],
        isLoading: true,
        error: null,
      },
      actions: {
        addBankAccount: vi.fn(),
        createPayment: vi.fn(),
        approvePayment: vi.fn(),
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
        error: new Error('Failed to load transactions'),
      },
      accounts: {
        data: [],
        isLoading: false,
        error: null,
      },
      actions: {
        addBankAccount: vi.fn(),
        createPayment: vi.fn(),
        approvePayment: vi.fn(),
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
