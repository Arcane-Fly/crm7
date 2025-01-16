'use client'

import { useState, useEffect } from 'react'
import { ratesService } from '@/lib/services/rates'
import type { RateCalculation } from '@/types/rates'
import { ErrorBoundary } from '@/components/error-boundary/ErrorBoundary'
import { Alert } from '@/components/ui/alert'

interface RateComparisonProps {
  templateId: string
  baseRate: number
}

export function RateComparison({ templateId, baseRate }: RateComparisonProps) {
  const [calculation, setCalculation] = useState<RateCalculation | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function calculateRate() {
      try {
        setLoading(true)
        setError(null)
        
        // First get the template
        const { data: template } = await ratesService.getTemplate(templateId)
        
        // Then calculate using the template with updated base rate
        const response = await ratesService.calculateRate({
          ...template,
          base_rate: baseRate,
        })
        
        setCalculation(response.data)
      } catch (err) {
        const error = err as Error
        setError(error.message)
        console.error('Failed to calculate rate:', error)
      } finally {
        setLoading(false)
      }
    }

    if (templateId && baseRate) {
      calculateRate()
    }
  }, [templateId, baseRate])

  const renderComparison = (calc: RateCalculation) => (
    <div className='space-y-4'>
      <div className='grid grid-cols-2 gap-4'>
        <div>
          <h3 className='text-lg font-semibold'>Base Rate</h3>
          <p className='text-2xl font-bold'>${calc.base_rate.toFixed(2)}</p>
        </div>

        {calc.casual_loading && (
          <div>
            <h3 className='text-lg font-semibold'>Casual Loading</h3>
            <p className='text-2xl font-bold'>
              ${(calc.base_rate * (calc.casual_loading / 100)).toFixed(2)}
            </p>
          </div>
        )}

        {calc.leave_loading_amount && (
          <div>
            <h3 className='text-lg font-semibold'>Leave Loading</h3>
            <p className='text-2xl font-bold'>${calc.leave_loading_amount.toFixed(2)}</p>
          </div>
        )}

        {calc.training_cost_amount && (
          <div>
            <h3 className='text-lg font-semibold'>Training Costs</h3>
            <p className='text-2xl font-bold'>${calc.training_cost_amount.toFixed(2)}</p>
          </div>
        )}

        {calc.other_costs_amount && (
          <div>
            <h3 className='text-lg font-semibold'>Other Costs</h3>
            <p className='text-2xl font-bold'>${calc.other_costs_amount.toFixed(2)}</p>
          </div>
        )}

        {calc.funding_offset_amount && (
          <div>
            <h3 className='text-lg font-semibold'>Funding Offset</h3>
            <p className='text-2xl font-bold text-green-600'>
              -${calc.funding_offset_amount.toFixed(2)}
            </p>
          </div>
        )}

        <div className='col-span-2'>
          <h3 className='text-lg font-semibold'>Final Rate</h3>
          <p className='text-3xl font-bold text-blue-600'>${calc.final_rate.toFixed(2)}</p>
        </div>
      </div>
    </div>
  )

  return (
    <ErrorBoundary>
      <div className='space-y-6'>
        <h2 className='text-2xl font-bold'>Rate Comparison</h2>
        {loading && <div>Calculating...</div>}
        {error && <Alert variant='destructive'>{error}</Alert>}
        {!loading && !error && calculation && renderComparison(calculation)}
      </div>
    </ErrorBoundary>
  )
}
