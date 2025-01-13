import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import { useUser } from '@/lib/hooks/use-user'
import { ratesService, RateCalculation } from '@/lib/services/rates'
import { formatCurrency } from '@/lib/utils'
import { DataTable } from '@/components/ui/data-table'
import { BarChart } from '@/components/ui/bar-chart'

export interface RateComparisonProps {
  employeeId?: string
  calculationId?: string
}

export function RateComparison({ employeeId, calculationId }: RateComparisonProps) {
  const { toast } = useToast()
  const { user } = useUser()
  const [loading, setLoading] = useState(false)
  const [calculations, setCalculations] = useState<RateCalculation[]>([])
  const [selectedCalculations, setSelectedCalculations] = useState<string[]>([])

  useEffect(() => {
    if (user?.org_id && (employeeId || calculationId)) {
      loadCalculations()
    }
  }, [user?.org_id, employeeId, calculationId])

  const loadCalculations = async () => {
    try {
      setLoading(true)
      const { data: history } = await ratesService.supabase
        .from('rate_calculation_history')
        .select('*')
        .eq('org_id', user!.org_id)
        .eq(employeeId ? 'employee_id' : 'calculation_id', employeeId || calculationId)
        .order('created_at', { ascending: false })

      setCalculations(history)
      if (history.length > 0) {
        setSelectedCalculations([history[0].id])
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load rate calculations',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const getComparisonData = () => {
    const selected = calculations.filter(c => selectedCalculations.includes(c.id))
    if (selected.length === 0) return null

    const components = [
      'Base Rate',
      'Casual Loading',
      'Super',
      'Leave Loading',
      'Workers Comp',
      'Payroll Tax',
      'Training Cost',
      'Other Costs',
      'Funding Offset',
      'Margin'
    ]

    const data = selected.map(calc => ({
      name: new Date(calc.calculation_date).toLocaleDateString(),
      'Base Rate': calc.base_rate,
      'Casual Loading': calc.casual_loading || 0,
      'Super': calc.super_amount,
      'Leave Loading': calc.leave_loading_amount || 0,
      'Workers Comp': calc.workers_comp_amount,
      'Payroll Tax': calc.payroll_tax_amount,
      'Training Cost': calc.training_cost_amount || 0,
      'Other Costs': calc.other_costs_amount || 0,
      'Funding Offset': calc.funding_offset_amount || 0,
      'Margin': calc.margin_amount
    }))

    return {
      data,
      components
    }
  }

  const comparisonData = getComparisonData()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rate Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <Label>Select Calculations to Compare</Label>
            <Select
              value={selectedCalculations[0]}
              onValueChange={(value) => setSelectedCalculations([value])}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a calculation" />
              </SelectTrigger>
              <SelectContent>
                {calculations.map((calc) => (
                  <SelectItem key={calc.id} value={calc.id}>
                    {new Date(calc.calculation_date).toLocaleDateString()} - {formatCurrency(calc.final_rate)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {comparisonData && (
            <>
              <div className="h-[400px]">
                <BarChart
                  data={comparisonData.data}
                  components={comparisonData.components}
                />
              </div>

              <DataTable
                columns={[
                  {
                    header: 'Component',
                    accessorKey: 'component'
                  },
                  ...comparisonData.data.map((d, i) => ({
                    header: `Rate ${i + 1}`,
                    accessorKey: `rate${i}`
                  })),
                  {
                    header: 'Difference',
                    accessorKey: 'difference'
                  }
                ]}
                data={comparisonData.components.map(component => ({
                  component,
                  ...comparisonData.data.reduce((acc, d, i) => ({
                    ...acc,
                    [`rate${i}`]: formatCurrency(d[component])
                  }), {}),
                  difference: comparisonData.data.length > 1
                    ? formatCurrency(
                        comparisonData.data[0][component] -
                        comparisonData.data[comparisonData.data.length - 1][component]
                      )
                    : '-'
                }))}
              />
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
