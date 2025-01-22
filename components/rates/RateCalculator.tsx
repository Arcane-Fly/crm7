import { useState, useEffect } from 'react'
import { useSupabase } from '@/lib/supabase/supabase-provider'
import { RateTemplate } from '@/lib/types/rates'
import { Select } from '@/components/ui/select'
import { ErrorBoundary } from '@/components/ui/error-boundary'
import { useToast } from '@/components/ui/use-toast'

interface RateCalculatorProps {
  org_id: string
  onCalculate?: (rate: number) => void
}

interface CalculationResult {
  base_amount: number
  super_amount: number
  leave_amount: number
  workers_comp_amount: number
  payroll_tax_amount: number
  training_amount: number
  other_amount: number
  total_amount: number
}

export default function RateCalculator({ org_id, onCalculate }: RateCalculatorProps) {
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const [templates, setTemplates] = useState<RateTemplate[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<CalculationResult | null>(null)

  useEffect(() => {
    async function fetchTemplates() {
      try {
        const { data, error } = await supabase
          .from('rate_templates')
          .select('*')
          .eq('org_id', org_id)
          .order('created_at', { ascending: false })

        if (error) throw error

        setTemplates(data as RateTemplate[])
      } catch (err) {
        console.error('Error fetching templates:', err)
        setError('Failed to load templates')
        toast({
          title: 'Error',
          description: 'Failed to load templates',
          variant: 'destructive',
        })
      } finally {
        setLoading(false)
      }
    }

    fetchTemplates()
  }, [org_id, supabase, toast])

  const calculateRate = async (template: RateTemplate) => {
    const baseAmount = template.base_rate * (1 + template.base_margin / 100)
    const superAmount = baseAmount * (template.super_rate / 100)
    const leaveAmount = baseAmount * (template.leave_loading / 100)
    const workersCompAmount = baseAmount * (template.workers_comp_rate / 100)
    const payrollTaxAmount = baseAmount * (template.payroll_tax_rate / 100)
    const trainingAmount = baseAmount * (template.training_cost_rate / 100)
    const otherAmount = baseAmount * (template.other_costs_rate / 100)

    const totalAmount = Number((
      baseAmount +
      superAmount +
      leaveAmount +
      workersCompAmount +
      payrollTaxAmount +
      trainingAmount +
      otherAmount -
      template.funding_offset
    ).toFixed(2))

    const result: CalculationResult = {
      base_amount: Number(baseAmount.toFixed(2)),
      super_amount: Number(superAmount.toFixed(2)),
      leave_amount: Number(leaveAmount.toFixed(2)),
      workers_comp_amount: Number(workersCompAmount.toFixed(2)),
      payroll_tax_amount: Number(payrollTaxAmount.toFixed(2)),
      training_amount: Number(trainingAmount.toFixed(2)),
      other_amount: Number(otherAmount.toFixed(2)),
      total_amount: totalAmount,
    }

    setResult(result)
    onCalculate?.(totalAmount)
  }

  const handleTemplateChange = (value: string) => {
    setSelectedTemplate(value)
    const template = templates.find(t => t.id === value)
    if (template) {
      calculateRate(template)
    }
  }

  if (loading) return <div>Loading templates...</div>
  if (error) return <div className="text-red-500">{error}</div>

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="template" className="text-sm font-medium">
              Select Rate Template
            </label>
            <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a template" />
              </SelectTrigger>
              <SelectContent>
                {templates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {result && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Calculation Result</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-gray-500">Base Amount</span>
                <p className="text-lg font-medium">${result.base_amount}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Super</span>
                <p className="text-lg font-medium">${result.super_amount}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Leave Loading</span>
                <p className="text-lg font-medium">${result.leave_amount}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Workers Comp</span>
                <p className="text-lg font-medium">${result.workers_comp_amount}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Payroll Tax</span>
                <p className="text-lg font-medium">${result.payroll_tax_amount}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Training</span>
                <p className="text-lg font-medium">${result.training_amount}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Other Costs</span>
                <p className="text-lg font-medium">${result.other_amount}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500 font-bold">Total Amount</span>
                <p className="text-lg font-bold">${result.total_amount}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  )
}
