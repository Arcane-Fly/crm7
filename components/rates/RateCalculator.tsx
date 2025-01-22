import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ratesService } from '@/lib/services/rates'
import type { RateTemplate, RateCalculation } from '@/lib/types/rates'
import { DatePicker } from '@/components/ui/date-picker'
import { useUser } from '@/lib/hooks/use-user'

interface RateCalculatorProps {
  orgId: string
}

export const RateCalculator = ({ orgId }: RateCalculatorProps) => {
  const [selectedTemplate, setSelectedTemplate] = useState<RateTemplate | null>(null)
  const [calculationDate, setCalculationDate] = useState<Date>()
  const [calculation, setCalculation] = useState<RateCalculation | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { user } = useUser()

  const { data: templates = [] } = useQuery({
    queryKey: ['rate_templates', { org_id: orgId }],
    queryFn: async () => {
      const { data } = await ratesService.getTemplates({ org_id: orgId })
      return data
    },
  })

  const handleCalculate = async () => {
    if (!selectedTemplate || !user) return

    try {
      const { data } = await ratesService.calculateRate({
        template_id: selectedTemplate.id,
        org_id: user.org_id,
        calculation_date: calculationDate?.toISOString(),
      })
      setCalculation(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to calculate rate')
      setCalculation(null)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-4">Rate Calculator</h2>
        
        {error && (
          <div className="text-red-600 mb-4">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block mb-2">
              Select Template:
              <select
                value={selectedTemplate?.id || ''}
                onChange={(e) => {
                  const template = templates.find(t => t.id === e.target.value)
                  setSelectedTemplate(template || null)
                }}
                className="block w-full mt-1"
              >
                <option value="">Select a template...</option>
                {templates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.template_name} - {template.template_type}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div>
            <label className="block mb-2">
              Calculation Date:
              <DatePicker
                selected={calculationDate}
                onSelect={setCalculationDate}
              />
            </label>
          </div>

          <button
            onClick={handleCalculate}
            disabled={!selectedTemplate}
            className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            Calculate Rate
          </button>
        </div>
      </div>

      {calculation && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Calculation Results</h3>
          <div className="space-y-2">
            <p>Base Rate: ${calculation.base_rate}</p>
            <p>Super Rate: {calculation.multipliers.super_rate}%</p>
            <p>Leave Loading: {calculation.multipliers.leave_loading}%</p>
            <p>Workers Comp: {calculation.multipliers.workers_comp_rate}%</p>
            <p>Payroll Tax: {calculation.multipliers.payroll_tax_rate}%</p>
            <p>Training Costs: {calculation.multipliers.training_cost_rate}%</p>
            <p>Other Costs: {calculation.multipliers.other_costs_rate}%</p>
            <p className="font-semibold">Total Amount: ${calculation.total_amount}</p>
          </div>
        </div>
      )}
    </div>
  )
}
