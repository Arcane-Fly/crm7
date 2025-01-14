'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DataTable } from '@/components/ui/data-table'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { RateCalculation } from '@/lib/services/rates'

export interface RateComparisonProps {
  employeeId?: string
  calculationId?: string
}

export function RateComparison({ employeeId, calculationId }: RateComparisonProps) {
  const [_loading, setLoading] = useState(false)
  const [calculations, setCalculations] = useState<RateCalculation[]>([])
  const [selectedCalculations, setSelectedCalculations] = useState<string[]>([])

  const loadCalculations = useCallback(async () => {
    try {
      setLoading(true)

      const { data: history } = await fetch('/api/rate-calculations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          employeeId,
          calculationId,
        }),
      }).then((response) => response.json())

      setCalculations(history)
      if (history.length > 0) {
        setSelectedCalculations([history[0].id])
      }
    } catch (error) {
      console.error('Failed to load rate calculations', error)
    } finally {
      setLoading(false)
    }
  }, [employeeId, calculationId])

  useEffect(() => {
    if (employeeId || calculationId) {
      loadCalculations()
    }
  }, [employeeId, calculationId, loadCalculations])

  const selected = calculations.filter((calc) => selectedCalculations.includes(calc.id))

  const columns = [
    {
      accessorKey: 'name',
      header: 'Component',
    },
    ...selected.map((calc) => ({
      accessorKey: calc.id,
      header: formatDate(new Date(calc.calculation_date)),
    })),
  ]

  const data = selected.map((calc) => ({
    name: formatDate(new Date(calc.calculation_date)),
    'Base Rate': calc.base_rate,
    'Casual Loading': calc.casual_loading || 0,
    Super: calc.super_amount,
    'Leave Loading': calc.leave_loading || 0,
    'Training Costs': calc.training_costs || 0,
    Insurance: calc.insurance_costs || 0,
    Margin: calc.margin_amount,
    'Final Rate': calc.final_rate,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rate Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='space-y-4'>
          <div className='space-y-2'>
            <Label>Select Calculations</Label>
            <Select
              value={selectedCalculations[0]}
              onValueChange={(value) => setSelectedCalculations([value])}
            >
              <SelectTrigger>
                <SelectValue placeholder='Select a calculation' />
              </SelectTrigger>
              <SelectContent>
                {calculations.map((calc) => (
                  <SelectItem key={calc.id} value={calc.id}>
                    {formatDate(new Date(calc.calculation_date))} -{' '}
                    {formatCurrency(calc.final_rate)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DataTable columns={columns} data={data} />
        </div>
      </CardContent>
    </Card>
  )
}
