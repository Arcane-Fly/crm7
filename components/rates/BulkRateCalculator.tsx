import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import { useUser } from '@/lib/hooks/use-user'
import { ratesService, RateTemplate } from '@/lib/services/rates'
import { DataTable } from '@/components/ui/data-table'
import { formatCurrency, formatDate } from '@/lib/utils'
import { DatePicker } from '@/components/ui/date-picker'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'

export function BulkRateCalculator() {
  const { toast } = useToast()
  const { user } = useUser()
  const [loading, setLoading] = useState(false)
  const [templates, setTemplates] = useState<RateTemplate[]>([])
  const [employees, setEmployees] = useState<any[]>([])
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([])
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([])
  const [calculationDate, setCalculationDate] = useState<Date>(new Date())
  const [baseRate, setBaseRate] = useState<number>(0)
  const [casualLoading, setCasualLoading] = useState<number>(0)
  const [bulkCalculations, setBulkCalculations] = useState<any[]>([])

  useEffect(() => {
    if (user?.org_id) {
      loadTemplates()
      loadEmployees()
      loadBulkCalculations()
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
        description: 'Failed to load templates',
        variant: 'destructive'
      })
    }
  }

  const loadEmployees = async () => {
    try {
      const { data } = await ratesService.supabase
        .from('employees')
        .select('*')
        .eq('org_id', user!.org_id)
        .eq('is_active', true)

      setEmployees(data || [])
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load employees',
        variant: 'destructive'
      })
    }
  }

  const loadBulkCalculations = async () => {
    try {
      const { data } = await ratesService.supabase
        .from('bulk_rate_calculations')
        .select('*')
        .eq('org_id', user!.org_id)
        .order('created_at', { ascending: false })
        .limit(10)

      setBulkCalculations(data || [])
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load bulk calculations',
        variant: 'destructive'
      })
    }
  }

  const handleCalculate = async () => {
    if (selectedTemplates.length === 0 || selectedEmployees.length === 0) {
      toast({
        title: 'Error',
        description: 'Please select at least one template and employee',
        variant: 'destructive'
      })
      return
    }

    try {
      setLoading(true)

      const { data, error } = await ratesService.supabase
        .from('bulk_rate_calculations')
        .insert({
          org_id: user!.org_id,
          name: `Bulk Calculation ${formatDate(calculationDate)}`,
          template_ids: selectedTemplates,
          employee_ids: selectedEmployees,
          calculation_date: calculationDate.toISOString(),
          parameters: {
            base_rate: baseRate,
            casual_loading: casualLoading
          },
          created_by: user!.id
        })
        .select()
        .single()

      if (error) throw error

      // Start processing
      await ratesService.supabase.rpc('process_bulk_calculations', {
        bulk_calc_id: data.id
      })

      toast({
        title: 'Success',
        description: 'Bulk calculation started'
      })

      loadBulkCalculations()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to start bulk calculation',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const renderResults = (calculation: any) => {
    if (!calculation.results) return null

    const results = Object.entries(calculation.results).map(([key, value]: [string, any]) => ({
      id: key,
      template_name: templates.find(t => t.id === value.template_id)?.template_name || 'Unknown',
      employee_name: employees.find(e => e.id === value.employee_id)?.name || 'Unknown',
      base_rate: value.base_rate,
      final_rate: value.final_rate,
      total_cost: value.total_cost
    }))

    return (
      <DataTable
        columns={[
          {
            header: 'Template',
            accessorKey: 'template_name'
          },
          {
            header: 'Employee',
            accessorKey: 'employee_name'
          },
          {
            header: 'Base Rate',
            accessorKey: 'base_rate',
            cell: ({ row }) => formatCurrency(row.original.base_rate)
          },
          {
            header: 'Final Rate',
            accessorKey: 'final_rate',
            cell: ({ row }) => formatCurrency(row.original.final_rate)
          },
          {
            header: 'Total Cost',
            accessorKey: 'total_cost',
            cell: ({ row }) => formatCurrency(row.original.total_cost)
          }
        ]}
        data={results}
      />
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bulk Rate Calculator</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Templates</Label>
              <Select
                value={selectedTemplates[0]}
                onValueChange={(value) => setSelectedTemplates([value])}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select templates" />
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
              <Label>Employees</Label>
              <Select
                value={selectedEmployees[0]}
                onValueChange={(value) => setSelectedEmployees([value])}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select employees" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Calculation Date</Label>
              <DatePicker
                date={calculationDate}
                onSelect={setCalculationDate}
              />
            </div>

            <div className="space-y-2">
              <Label>Base Rate</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={baseRate}
                onChange={(e) => setBaseRate(Number(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label>Casual Loading (%)</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={casualLoading}
                onChange={(e) => setCasualLoading(Number(e.target.value))}
              />
            </div>
          </div>

          <Button
            onClick={handleCalculate}
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Calculating...' : 'Calculate Rates'}
          </Button>

          <div className="space-y-4">
            <h3 className="font-semibold">Recent Calculations</h3>
            {bulkCalculations.map((calc) => (
              <Card key={calc.id}>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">{calc.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(calc.created_at)}
                        </p>
                      </div>
                      <Badge
                        variant={
                          calc.status === 'completed' ? 'success' :
                          calc.status === 'failed' ? 'destructive' :
                          'default'
                        }
                      >
                        {calc.status}
                      </Badge>
                    </div>

                    {calc.status === 'processing' && (
                      <Progress value={75} />
                    )}

                    {calc.status === 'completed' && renderResults(calc)}

                    {calc.status === 'failed' && calc.error_log && (
                      <ScrollArea className="h-[100px] rounded-md border p-4">
                        <pre className="text-sm text-destructive">
                          {JSON.stringify(calc.error_log, null, 2)}
                        </pre>
                      </ScrollArea>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
