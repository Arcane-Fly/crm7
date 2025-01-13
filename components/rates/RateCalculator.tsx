"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import { useUser } from '@/lib/hooks/use-user'
import { ratesService, RateTemplate, RateCalculation, CalculateRateParams } from '@/lib/services/rates'
import { formatCurrency } from '@/lib/utils'

export interface RateCalculatorProps {
  employeeId?: string
  onCalculate?: (calculation: RateCalculation) => void
}

export function RateCalculator({ employeeId, onCalculate }: RateCalculatorProps) {
  const { toast } = useToast()
  const { user } = useUser()
  const [loading, setLoading] = useState(false)
  const [templates, setTemplates] = useState<RateTemplate[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<RateTemplate | null>(null)
  const [baseRate, setBaseRate] = useState<number>(0)
  const [casualLoading, setCasualLoading] = useState<number>(0)
  const [calculation, setCalculation] = useState<RateCalculation | null>(null)

  useEffect(() => {
    if (user?.org_id) {
      loadTemplates()
    }
  }, [user?.org_id])

  const loadTemplates = async () => {
    try {
      const data = await ratesService.getRateTemplates({
        org_id: user!.org_id,
        is_active: true
      })
      setTemplates(data)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load rate templates',
        variant: 'destructive'
      })
    }
  }

  const handleCalculate = async () => {
    if (!selectedTemplate || !employeeId) return

    try {
      setLoading(true)

      const params: CalculateRateParams = {
        template_id: selectedTemplate.id,
        employee_id: employeeId,
        base_rate: baseRate,
        casual_loading: casualLoading || undefined
      }

      const result = await ratesService.calculateRate(params)
      setCalculation(result)
      onCalculate?.(result)

      await ratesService.saveRateCalculation({
        ...result,
        org_id: user!.org_id
      })

      toast({
        title: 'Success',
        description: 'Rate calculation completed'
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to calculate rate',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rate Calculator</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="template">Rate Template</Label>
            <Select
              value={selectedTemplate?.id}
              onValueChange={(value) => {
                const template = templates.find(t => t.id === value)
                setSelectedTemplate(template || null)
              }}
            >
              <SelectTrigger id="template">
                <SelectValue placeholder="Select a template" />
              </SelectTrigger>
              <SelectContent>
                {templates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.template_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
            />
          </div>

          {selectedTemplate?.template_type === 'casual' && (
            <div className="space-y-2">
              <Label htmlFor="casualLoading">Casual Loading (%)</Label>
              <Input
                id="casualLoading"
                type="number"
                min="0"
                step="0.01"
                value={casualLoading}
                onChange={(e) => setCasualLoading(Number(e.target.value))}
              />
            </div>
          )}

          <Button
            onClick={handleCalculate}
            disabled={!selectedTemplate || loading}
            className="w-full"
          >
            {loading ? 'Calculating...' : 'Calculate Rate'}
          </Button>

          {calculation && (
            <div className="mt-6 space-y-4">
              <h3 className="font-semibold">Calculation Results</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Base Rate</Label>
                  <div>{formatCurrency(calculation.base_rate)}</div>
                </div>

                {calculation.casual_loading > 0 && (
                  <div>
                    <Label>Casual Loading</Label>
                    <div>{formatCurrency(calculation.casual_loading)}</div>
                  </div>
                )}

                <div>
                  <Label>Superannuation</Label>
                  <div>{formatCurrency(calculation.super_amount)}</div>
                </div>

                {calculation.leave_loading_amount > 0 && (
                  <div>
                    <Label>Leave Loading</Label>
                    <div>{formatCurrency(calculation.leave_loading_amount)}</div>
                  </div>
                )}

                <div>
                  <Label>Workers Comp</Label>
                  <div>{formatCurrency(calculation.workers_comp_amount)}</div>
                </div>

                <div>
                  <Label>Payroll Tax</Label>
                  <div>{formatCurrency(calculation.payroll_tax_amount)}</div>
                </div>

                {calculation.training_cost_amount > 0 && (
                  <div>
                    <Label>Training Cost</Label>
                    <div>{formatCurrency(calculation.training_cost_amount)}</div>
                  </div>
                )}

                {calculation.other_costs_amount > 0 && (
                  <div>
                    <Label>Other Costs</Label>
                    <div>{formatCurrency(calculation.other_costs_amount)}</div>
                  </div>
                )}

                {calculation.funding_offset_amount > 0 && (
                  <div>
                    <Label>Funding Offset</Label>
                    <div>-{formatCurrency(calculation.funding_offset_amount)}</div>
                  </div>
                )}

                <div>
                  <Label>Margin</Label>
                  <div>{formatCurrency(calculation.margin_amount)}</div>
                </div>

                <div className="col-span-2">
                  <Label>Total Cost</Label>
                  <div className="text-lg font-bold">
                    {formatCurrency(calculation.total_cost)}
                  </div>
                </div>

                <div className="col-span-2">
                  <Label>Final Rate</Label>
                  <div className="text-lg font-bold text-primary">
                    {formatCurrency(calculation.final_rate)}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
