import { useState, useEffect } from 'react'
import type { RateTemplate, RateCalculation } from '@/types/rates'
import { ratesService } from '@/lib/services/rates'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Alert } from '@/components/ui/alert'

interface RateCalculatorProps {
  orgId: string
}

export function RateCalculator({ orgId }: RateCalculatorProps) {
  const [templates, setTemplates] = useState<RateTemplate[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<RateTemplate | null>(null)
  const [baseRate, setBaseRate] = useState<number>(0)
  const [calculation, setCalculation] = useState<RateCalculation | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadTemplates() {
      try {
        const templates = await ratesService.getTemplates({
          org_id: orgId,
          is_active: true,
          status: 'active',
        })
        setTemplates(templates)
      } catch (err) {
        setError('Failed to load rate templates')
        console.error(err)
      }
    }
    loadTemplates()
  }, [orgId])

  const handleTemplateChange = (templateId: string) => {
    const template = templates.find((t) => t.id === templateId)
    setSelectedTemplate(template || null)
    setCalculation(null)
  }

  const handleCalculate = async () => {
    if (!selectedTemplate || baseRate <= 0) {
      setError('Please select a template and enter a valid base rate')
      return
    }

    try {
      const result = await ratesService.calculateRate(selectedTemplate)
      setCalculation(result)
      setError(null)
    } catch (err) {
      setError('Failed to calculate rate')
      console.error(err)
    }
  }

  return (
    <Card className='p-6'>
      <div className='space-y-6'>
        <div>
          <Label htmlFor='template'>Rate Template</Label>
          <select
            id='template'
            className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50'
            value={selectedTemplate?.id || ''}
            onChange={(e) => handleTemplateChange(e.target.value)}
          >
            <option value=''>Select a template</option>
            {templates.map((template) => (
              <option key={template.id} value={template.id}>
                {template.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label htmlFor='baseRate'>Base Rate</Label>
          <Input
            id='baseRate'
            type='number'
            min='0'
            step='0.01'
            value={baseRate}
            onChange={(e) => setBaseRate(parseFloat(e.target.value) || 0)}
          />
        </div>

        <Button onClick={handleCalculate} disabled={!selectedTemplate || baseRate <= 0}>
          Calculate Rate
        </Button>

        {error && <Alert variant='destructive'>{error}</Alert>}

        {calculation && (
          <div className='mt-6 space-y-4'>
            <h3 className='text-lg font-medium'>Calculation Results</h3>

            <div className='grid grid-cols-2 gap-4'>
              <div>
                <Label>Base Rate</Label>
                <div className='text-2xl font-bold'>${calculation.base_rate.toFixed(2)}</div>
              </div>

              {calculation.casual_loading && (
                <div>
                  <Label>Casual Loading</Label>
                  <div className='text-2xl font-bold'>
                    ${(calculation.base_rate * (calculation.casual_loading / 100)).toFixed(2)}
                  </div>
                </div>
              )}

              {calculation.leave_loading_amount && (
                <div>
                  <Label>Leave Loading</Label>
                  <div className='text-2xl font-bold'>
                    ${calculation.leave_loading_amount.toFixed(2)}
                  </div>
                </div>
              )}

              {calculation.training_cost_amount && (
                <div>
                  <Label>Training Costs</Label>
                  <div className='text-2xl font-bold'>
                    ${calculation.training_cost_amount.toFixed(2)}
                  </div>
                </div>
              )}

              {calculation.other_costs_amount && (
                <div>
                  <Label>Other Costs</Label>
                  <div className='text-2xl font-bold'>
                    ${calculation.other_costs_amount.toFixed(2)}
                  </div>
                </div>
              )}

              {calculation.funding_offset_amount && (
                <div>
                  <Label>Funding Offset</Label>
                  <div className='text-2xl font-bold text-green-600'>
                    -${calculation.funding_offset_amount.toFixed(2)}
                  </div>
                </div>
              )}

              <div className='col-span-2'>
                <Label>Final Rate</Label>
                <div className='text-3xl font-bold text-blue-600'>
                  ${calculation.final_rate.toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
