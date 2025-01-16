import { render, screen, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import { RateDashboard } from '../RateDashboard'
import { ratesService } from '@/lib/services/rates'

// Mock the rates service
vi.mock('@/lib/services/rates', () => ({
  ratesService: {
    getForecastsByDateRange: vi.fn(),
    getReportsByDateRange: vi.fn(),
  },
}))

const mockForecasts = [
  {
    forecast_date: '2024-01-01',
    forecast_value: 100,
  },
]

const mockReports = [
  {
    report_date: '2024-01-01',
    data: { actual_rate: 95 },
  },
]

describe('RateDashboard', () => {
  beforeEach(() => {
    vi.mocked(ratesService.getForecastsByDateRange).mockResolvedValue({ data: mockForecasts })
    vi.mocked(ratesService.getReportsByDateRange).mockResolvedValue({ data: mockReports })
  })

  it('renders without crashing', () => {
    render(<RateDashboard orgId="test-org" />)
    await waitFor(() => {
      expect(screen.getByText(/Rate Analytics/i)).toBeInTheDocument()
      expect(screen.getByText('$100.00')).toBeInTheDocument()
    })
  })

  it('loads forecasts and reports on mount', async () => {
    render(<RateDashboard orgId="test-org" />)
    
    await waitFor(() => {
      expect(ratesService.getForecastsByDateRange).toHaveBeenCalled()
      expect(ratesService.getReportsByDateRange).toHaveBeenCalled()
    })
  })

  it('displays loading state initially', () => {
    render(<RateDashboard orgId="test-org" />)
    expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument()
  })

  it('displays error message when data fetch fails', async () => {
    vi.mocked(ratesService.getForecastsByDateRange).mockRejectedValueOnce(new Error('Test error'))

    render(<RateDashboard orgId="test-org" />)

    await waitFor(() => {
      expect(screen.getByText(/Failed to load dashboard data/i)).toBeInTheDocument()
    })
  })

  it('updates data when date range changes', async () => {
    render(<RateDashboard orgId="test-org" />)

    // Wait for initial load
    await waitFor(() => {
      expect(ratesService.getForecastsByDateRange).toHaveBeenCalled()
    })

    // Clear mocks
    vi.clearAllMocks()

    // Change date range
    const dateRangePicker = screen.getByRole('button', { name: /Date Range/i })
    fireEvent.click(dateRangePicker)

    // Select new date range
    // Note: Actual date selection would depend on your date picker component
    // This is just a simplified example

    await waitFor(() => {
      expect(ratesService.getForecastsByDateRange).toHaveBeenCalledWith({
        org_id: 'test-org',
        start_date: expect.any(String),
        end_date: expect.any(String),
      })
    })
  })
})
