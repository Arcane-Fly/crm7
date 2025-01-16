import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { RateCalculator } from '../RateCalculator'
import { ratesService } from '@/lib/services/rates'

vi.mock('@/lib/services/rates', () => ({
  ratesService: {
    getTemplates: vi.fn(),
    calculateRate: vi.fn(),
  },
}))

describe('RateCalculator', () => {
  const mockOrgId = 'test-org-id'
  const mockTemplates = [
    { id: '1', name: 'Template 1', multiplier: 1.5 },
    { id: '2', name: 'Template 2', multiplier: 2.0 },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    ;(ratesService.getTemplates as any).mockResolvedValue({ data: mockTemplates })
  })

  it('renders loading skeleton initially', () => {
    render(<RateCalculator orgId={mockOrgId} />)
    expect(screen.getByTestId('rate-calculator-skeleton')).toBeInTheDocument()
  })

  it('loads and displays templates', async () => {
    render(<RateCalculator orgId={mockOrgId} />)

    await waitFor(() =>
      expect(ratesService.getTemplates).toHaveBeenCalledWith({
        org_id: mockOrgId,
      })
    )

    mockTemplates.forEach((template) => {
      expect(screen.getByText(template.name)).toBeInTheDocument()
    })
  })

  it('handles calculation with valid inputs', async () => {
    const mockCalculation = {
      base_rate: 100,
      multiplier: 1.5,
      final_rate: 150,
    }
    ;(ratesService.calculateRate as any).mockResolvedValue({
      data: mockCalculation,
    })

    render(<RateCalculator orgId={mockOrgId} />)

    // Wait for templates to load
    await screen.findByLabelText(/base rate/i)

    // Set values and calculate
    fireEvent.change(screen.getByLabelText(/base rate/i), {
      target: { value: '100' },
    })
    fireEvent.click(screen.getByText(/calculate/i))

    // Check result
    expect(await screen.findByText('150')).toBeInTheDocument()
  })

  it('displays error message on API failure', async () => {
    const errorMessage = 'Failed to load templates'
    ;(ratesService.getTemplates as any).mockRejectedValue(new Error(errorMessage))

    render(<RateCalculator orgId={mockOrgId} />)

    expect(await screen.findByText(errorMessage)).toBeInTheDocument()
  })
})
