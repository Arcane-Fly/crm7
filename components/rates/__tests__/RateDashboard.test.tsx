import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { RateDashboard } from '../RateDashboard'
import { ratesService } from '@/lib/services/rates'
import { subDays, format } from 'date-fns'

// Mock Chart.js
vi.mock('chart.js', () => ({
  Chart: {
    register: vi.fn(),
  },
  CategoryScale: vi.fn(),
  LinearScale: vi.fn(),
  PointElement: vi.fn(),
  LineElement: vi.fn(),
  BarElement: vi.fn(),
  Title: vi.fn(),
  Tooltip: vi.fn(),
  Legend: vi.fn(),
}))

// Mock react-chartjs-2
vi.mock('react-chartjs-2', () => ({
  Line: () => <div data-testid='line-chart'>Line Chart</div>,
  Bar: () => <div data-testid='bar-chart'>Bar Chart</div>,
}))

// Mock rates service
vi.mock('@/lib/services/rates', () => ({
  ratesService: {
    getForecastsByDateRange: vi.fn(),
    getReportsByDateRange: vi.fn(),
  },
}))

describe('RateDashboard', () => {
  const mockOrgId = 'test-org-id'
  const today = new Date()
  const thirtyDaysAgo = subDays(today, 30)

  const mockForecasts = [
    {
      id: '1',
      forecast_date: format(subDays(today, 2), 'yyyy-MM-dd'),
      forecast_value: 150,
      confidence: 0.9,
    },
    {
      id: '2',
      forecast_date: format(subDays(today, 1), 'yyyy-MM-dd'),
      forecast_value: 155,
      confidence: 0.85,
    },
  ]

  const mockReports = [
    {
      id: '1',
      report_date: format(subDays(today, 2), 'yyyy-MM-dd'),
      data: { actual_rate: 148 },
    },
    {
      id: '2',
      report_date: format(subDays(today, 1), 'yyyy-MM-dd'),
      data: { actual_rate: 152 },
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    ;(ratesService.getForecastsByDateRange as any).mockResolvedValue({ data: mockForecasts })
    ;(ratesService.getReportsByDateRange as any).mockResolvedValue({ data: mockReports })
  })

  it('renders dashboard with charts', async () => {
    render(<RateDashboard orgId={mockOrgId} />)

    // Check if charts are rendered
    await waitFor(() => {
      expect(screen.getByTestId('line-chart')).toBeInTheDocument()
    })
    await waitFor(() => {
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument()
    })
  })

  it('loads forecast and report data on mount', async () => {
    render(<RateDashboard orgId={mockOrgId} />)

    await waitFor(() => {
      expect(ratesService.getForecastsByDateRange).toHaveBeenCalledWith({
        org_id: mockOrgId,
        start_date: format(thirtyDaysAgo, 'yyyy-MM-dd'),
        end_date: format(today, 'yyyy-MM-dd'),
      })
    })

    await waitFor(() => {
      expect(ratesService.getReportsByDateRange).toHaveBeenCalledWith({
        org_id: mockOrgId,
        start_date: format(thirtyDaysAgo, 'yyyy-MM-dd'),
        end_date: format(today, 'yyyy-MM-dd'),
      })
    })
  })

  it('handles API errors gracefully', async () => {
    const errorMessage = 'Failed to load rate data'
    ;(ratesService.getForecastsByDateRange as any).mockRejectedValue(new Error(errorMessage))

    render(<RateDashboard orgId={mockOrgId} />)

    expect(await screen.findByText(errorMessage)).toBeInTheDocument()
  })

  it('updates data when date range changes', async () => {
    render(<RateDashboard orgId={mockOrgId} />)

    // Find and click the date range picker
    const dateRangePicker = screen.getByRole('button', { name: /pick a date/i })
    fireEvent.click(dateRangePicker)

    // Wait for API calls to be made with new date range
    await waitFor(() => {
      expect(ratesService.getForecastsByDateRange).toHaveBeenCalled()
    })
    await waitFor(() => {
      expect(ratesService.getReportsByDateRange).toHaveBeenCalled()
    })
  })
})
