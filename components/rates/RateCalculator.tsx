'use client'

import { useState, useEffect, useCallback } from 'react'
import type { 
  RateCalculation,
  RateTemplateStatus 
} from '@/types/rates'
import type { RateTemplate } from '@/lib/services/rates'
import { ratesService } from '@/lib/services/rates'
import { logger } from '@/lib/services/logger'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Alert } from '@/components/ui/alert'
import { ErrorBoundary } from '@/components/error-boundary/ErrorBoundary'
import { RateCalculatorSkeleton } from '@/components/ui/skeleton'

/**
 * Custom error type for RateCalculator component
 * @interface RateCalculatorError
 * @extends {Error}
 */
interface RateCalculatorError extends Error {
  /** Error code for specific error cases */
  code?: string;
  /** Additional error details */
  details?: Record<string, unknown>;
}

/**
 * Props for the RateCalculator component
 * @interface RateCalculatorProps
 */
interface RateCalculatorProps {
  /** Organization ID for rate calculations */
  orgId: string;
}

/**
 * RateCalculator Component
 * 
 * A component that allows users to calculate rates based on templates and base rates.
 * It provides real-time rate calculations and displays the results in a structured format.
 * 
 * @component
 * @param {RateCalculatorProps} props - Component props
 * @returns {JSX.Element} Rendered component
 */
export function RateCalculator({ orgId }: RateCalculatorProps) {
  // State management for templates and calculations
  const [templates, setTemplates] = useState<RateTemplate[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<RateTemplate | null>(null)
  const [baseRate, setBaseRate] = useState<number>(0)
  const [calculation, setCalculation] = useState<RateCalculation | null>(null)
  const [error, setError] = useState<RateCalculatorError | null>(null)
  const [loading, setLoading] = useState<boolean>(false)

  /**
   * Fetches available rate templates for the organization
   */
  const fetchTemplates = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      logger.info('Fetching rate templates', { orgId }, 'RateCalculator')
      
      const response = await ratesService.getTemplates({ 
        org_id: orgId,
        is_active: true,
        status: 'active' as RateTemplateStatus
      })
      setTemplates(response.data)
      
      logger.info('Templates fetched successfully', 
        { count: response.data.length },
        'RateCalculator'
      )
    } catch (err) {
      const error = err as RateCalculatorError
      logger.error(
        'Failed to fetch rate templates',
        error,
        { orgId },
        'RateCalculator'
      )
      setError({
        name: 'TemplateError',
        message: 'Failed to fetch rate templates',
        code: error.code,
        details: error.details
      })
    } finally {
      setLoading(false)
    }
  }, [orgId])

  /**
   * Handles rate calculation based on selected template and base rate
   */
  const handleCalculate = useCallback(async () => {
    if (!selectedTemplate || baseRate <= 0) {
      const message = 'Invalid calculation parameters'
      logger.warn(
        message,
        { 
          templateId: selectedTemplate?.id,
          baseRate,
          orgId 
        },
        'RateCalculator'
      )
      setError({
        name: 'ValidationError',
        message: 'Please select a template and enter a valid base rate',
        code: 'INVALID_INPUT'
      })
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      logger.info(
        'Calculating rate',
        { 
          templateId: selectedTemplate.id,
          baseRate,
          orgId 
        },
        'RateCalculator'
      )

      // Ensure template has required properties
      if (!selectedTemplate.id) {
        throw new Error('Template ID is required for calculation')
      }

      // Update the template with the new base rate for calculation
      const templateForCalc = {
        ...selectedTemplate,
        base_rate: baseRate,
        id: selectedTemplate.id
      } as const // Use const assertion to ensure id is treated as required

      const result = await ratesService.calculateRate(templateForCalc)
      setCalculation(result.data)

      logger.info(
        'Rate calculated successfully',
        { 
          templateId: selectedTemplate.id,
          finalRate: result.data.final_rate 
        },
        'RateCalculator'
      )
    } catch (err) {
      const error = err as RateCalculatorError
      logger.error(
        'Failed to calculate rate',
        error,
        { 
          templateId: selectedTemplate.id,
          baseRate,
          orgId 
        },
        'RateCalculator'
      )
      setError({
        name: 'CalculationError',
        message: 'Failed to calculate rate',
        code: error.code,
        details: error.details
      })
    } finally {
      setLoading(false)
    }
  }, [selectedTemplate, baseRate, orgId])

  // Fetch templates on component mount
  useEffect(() => {
    fetchTemplates()
  }, [fetchTemplates])

  if (loading && !templates.length) {
    return <RateCalculatorSkeleton />
  }

  return (
    <ErrorBoundary>
      <Card className="p-6">
        <div className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <p className="text-sm font-medium">{error.message}</p>
              {error.details && (
                <p className="text-xs mt-1">
                  {JSON.stringify(error.details)}
                </p>
              )}
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="template">Rate Template</Label>
            <select
              id="template"
              className="w-full p-2 border rounded"
              value={selectedTemplate?.id || ''}
              aria-label="Select rate template"
              onChange={(e) => {
                const template = templates.find(t => t.id === e.target.value)
                setSelectedTemplate(template || null)
              }}
            >
              <option value="">Select a template</option>
              {templates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.template_name} ({template.template_type})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="baseRate">Base Rate</Label>
            <Input
              id="baseRate"
              type="number"
              min="0"
              step="0.01"
              value={baseRate}
              onChange={(e) => setBaseRate(Number(e.target.value))}
              placeholder="Enter base rate"
            />
          </div>

          <Button
            onClick={handleCalculate}
            disabled={loading || !selectedTemplate || baseRate <= 0}
          >
            {loading ? 'Calculating...' : 'Calculate Rate'}
          </Button>

          {calculation && (
            <div className="mt-4 space-y-2">
              <h3 className="font-semibold">Calculation Results</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>Base Rate:</div>
                <div>${calculation.base_rate.toFixed(2)}</div>
                <div>Super Amount:</div>
                <div>${calculation.super_amount.toFixed(2)}</div>
                <div>Leave Loading:</div>
                <div>${calculation.leave_loading.toFixed(2)}</div>
                <div>Training Costs:</div>
                <div>${calculation.training_costs.toFixed(2)}</div>
                <div>Insurance Costs:</div>
                <div>${calculation.insurance_costs.toFixed(2)}</div>
                <div>Total Cost:</div>
                <div>${calculation.total_cost.toFixed(2)}</div>
                <div className="font-semibold">Final Rate:</div>
                <div className="font-semibold">${calculation.final_rate.toFixed(2)}</div>
              </div>
            </div>
          )}
        </div>
      </Card>
    </ErrorBoundary>
  )
}
