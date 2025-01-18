import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import { RateCalculator } from '../RateCalculator'
import { ratesService } from '@/lib/services/rates'

// Mock the rates service
vi.mock('@/lib/services/rates', () => ({
  ratesService: {
    getTemplates: vi.fn(),
    calculateRate: vi.fn(),
  },
}))

const mockTemplates = [
  {
    id: '1',
    template_name: 'Test Template',
    template_type: 'apprentice',
    base_rate: 20,
  },
]

const mockCalculation = {
  base_rate: 20,
  super_amount: 2,
  leave_loading: 1,
  training_costs: 1,
  insurance_costs: 1,
  total_cost: 25,
  final_rate: 30,
}

describe('RateCalculator', () => {
  beforeEach(() => {
    vi.mocked(ratesService.getTemplates).mockResolvedValue({ data: mockTemplates })
    vi.mocked(ratesService.calculateRate).mockResolvedValue({ data: mockCalculation })
  })

  it('renders without crashing', () => {
    render(<RateCalculator orgId='test-org' />)
    expect(screen.getByText(/Rate Template/i)).toBeInTheDocument()
  })

  it('loads templates on mount', async () => {
    render(<RateCalculator orgId='test-org' />)
    await waitFor(() => {
      expect(ratesService.getTemplates).toHaveBeenCalledWith({
        org_id: 'test-org',
        is_active: true,
        status: 'active',
      })
    })
  })

  it('calculates rates when form is submitted', async () => {
    render(<RateCalculator orgId='test-org' />)

    // Wait for templates to load
    await waitFor(() => {
      expect(screen.getByText(/Test Template/i)).toBeInTheDocument()
    })

    // Select template
    fireEvent.change(screen.getByRole('combobox'), {
      target: { value: '1' },
    })

    // Enter base rate
    fireEvent.change(screen.getByRole('spinbutton'), {
      target: { value: '20' },
    })

    // Click calculate button
    fireEvent.click(screen.getByRole('button', { name: /Calculate Rate/i }))

    // Verify calculation was called
    await waitFor(() => {
      expect(ratesService.calculateRate).toHaveBeenCalled()
    })

    // Verify results are displayed
    expect(screen.getByText(/Final Rate/i)).toBeInTheDocument()
    expect(screen.getByText(/\$30.00/)).toBeInTheDocument()
  })

  it('shows error message when calculation fails', async () => {
    vi.mocked(ratesService.calculateRate).mockRejectedValueOnce(new Error('Test error'))

    render(<RateCalculator orgId='test-org' />)

    // Wait for templates to load
    await waitFor(() => {
      expect(screen.getByText(/Test Template/i)).toBeInTheDocument()
    })

    // Select template
    fireEvent.change(screen.getByRole('combobox'), {
      target: { value: '1' },
    })

    // Enter base rate
    fireEvent.change(screen.getByRole('spinbutton'), {
      target: { value: '20' },
    })

    // Click calculate button
    fireEvent.click(screen.getByRole('button', { name: /Calculate Rate/i }))

    // Verify error message is displayed
    await waitFor(() => {
      expect(screen.getByText(/Failed to calculate rate/i)).toBeInTheDocument()
    })
  })

  it('disables calculate button when form is invalid', () => {
    render(<RateCalculator orgId='test-org' />)
    const calculateButton = screen.getByRole('button', { name: /Calculate Rate/i })
    expect(calculateButton).toBeDisabled()
  })
})
