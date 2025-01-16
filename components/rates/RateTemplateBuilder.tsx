'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import { useUser } from '@/lib/hooks/use-user'
import { ratesService, type RateTemplate } from '@/lib/services/rates'
import { DatePicker } from '@/components/ui/date-picker'
import { format } from 'date-fns'

export interface RateTemplateBuilderProps {
  templateId?: string
  onSave?: (template: RateTemplate) => void
}

export function RateTemplateBuilder({ templateId, onSave }: RateTemplateBuilderProps) {
  const { toast } = useToast()
  const { user } = useUser()
  const [loading, setLoading] = useState(false)
  const [template, setTemplate] = useState<Partial<RateTemplate>>({
    template_type: 'apprentice' as const,
    is_active: true,
    rules: {},
    leave_loading: 0,
    training_cost_rate: 0,
    base_rate: 0,
  })
  const [errors, setErrors] = useState<string[]>([])

  const loadTemplate = useCallback(async () => {
    if (!templateId || !user?.org_id) return
    try {
      const response = await ratesService.getTemplate(templateId)
      if (response.data) {
        setTemplate(response.data)
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load template',
        variant: 'destructive',
      })
    }
  }, [templateId, toast, user])

  useEffect(() => {
    if (user?.org_id) {
      loadTemplate()
    }
  }, [loadTemplate, user])

  const handleSave = async () => {
    if (!user?.org_id || !template.template_name) {
      setErrors(['Required fields are missing'])
      return
    }

    try {
      setLoading(true)
      setErrors([])

      const validation = await ratesService.validateRateTemplate(template)
      if (!validation.data.valid) {
        setErrors(validation.data.errors || ['Validation failed'])
        return
      }

      // Generate a UUID for new templates
      const id = templateId || crypto.randomUUID()

      // Ensure required fields are present
      if (!template.template_name) {
        throw new Error('Template name is required')
      }

      const fullTemplate: RateTemplate = {
        ...template,
        id,
        template_name: template.template_name,
        template_type: template.template_type || 'apprentice',
        org_id: user.org_id,
        effective_from: format(new Date(), 'yyyy-MM-dd'),
        version_number: template.version_number || 1,
        rules: template.rules || {},
        is_active: template.is_active || false,
        is_approved: template.is_approved || false,
        base_rate: template.base_rate || 0,
        base_margin: template.base_margin || 0,
        super_rate: template.super_rate || 0,
        workers_comp_rate: template.workers_comp_rate || 0,
        payroll_tax_rate: template.payroll_tax_rate || 0,
        leave_loading: template.leave_loading || 0,
        training_cost_rate: template.training_cost_rate || 0,
      }

      const savedTemplate = await ratesService.saveTemplate(fullTemplate)
      toast({
        title: 'Success',
        description: 'Template saved successfully',
      })
      onSave?.(savedTemplate)
    } catch (error) {
      const err = error as Error
      setErrors([err.message])
      toast({
        title: 'Error',
        description: 'Failed to save template',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleEffectiveFromChange = useCallback(
    (newDate: Date | ((prevDate: Date | undefined) => Date | undefined) | undefined) => {
      if (newDate instanceof Date) {
        setTemplate((prev) => ({
          ...prev,
          effective_from: format(newDate, 'yyyy-MM-dd'),
        }))
      }
    },
    []
  )

  const handleEffectiveToChange = useCallback(
    (newDate: Date | ((prevDate: Date | undefined) => Date | undefined) | undefined) => {
      if (newDate instanceof Date) {
        setTemplate((prev) => ({
          ...prev,
          effective_to: format(newDate, 'yyyy-MM-dd'),
        }))
      }
    },
    []
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>{templateId ? 'Edit Rate Template' : 'Create Rate Template'}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='space-y-4'>
          {errors.length > 0 && (
            <div className='rounded-md bg-destructive/10 p-4'>
              <h4 className='mb-2 font-semibold text-destructive'>
                Please fix the following errors:
              </h4>
              <ul className='list-inside list-disc space-y-1'>
                {errors.map((error, index) => (
                  <li key={index} className='text-destructive'>
                    {error}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className='space-y-2'>
            <Label htmlFor='templateName'>Template Name</Label>
            <Input
              id='templateName'
              value={template.template_name || ''}
              onChange={(e) =>
                setTemplate((prev) => ({
                  ...prev,
                  template_name: e.target.value,
                }))
              }
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='templateType'>Template Type</Label>
            <Select
              value={template.template_type}
              onValueChange={(value) =>
                setTemplate((prev) => ({
                  ...prev,
                  template_type: value as RateTemplate['template_type'],
                }))
              }
            >
              <SelectTrigger id='templateType'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='apprentice'>Apprentice</SelectItem>
                <SelectItem value='trainee'>Trainee</SelectItem>
                <SelectItem value='casual'>Casual</SelectItem>
                <SelectItem value='permanent'>Permanent</SelectItem>
                <SelectItem value='contractor'>Contractor</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='baseMargin'>Base Margin (%)</Label>
              <Input
                id='baseMargin'
                type='number'
                min='0'
                step='0.01'
                value={template.base_margin || ''}
                onChange={(e) =>
                  setTemplate((prev) => ({
                    ...prev,
                    base_margin: Number(e.target.value),
                  }))
                }
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='superRate'>Super Rate (%)</Label>
              <Input
                id='superRate'
                type='number'
                min='0'
                step='0.01'
                value={template.super_rate || ''}
                onChange={(e) =>
                  setTemplate((prev) => ({
                    ...prev,
                    super_rate: Number(e.target.value),
                  }))
                }
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='leaveLoading'>Leave Loading (%)</Label>
              <Input
                id='leaveLoading'
                type='number'
                min='0'
                step='0.01'
                value={template.leave_loading || ''}
                onChange={(e) =>
                  setTemplate((prev) => ({
                    ...prev,
                    leave_loading: Number(e.target.value),
                  }))
                }
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='workersCompRate'>Workers Comp Rate (%)</Label>
              <Input
                id='workersCompRate'
                type='number'
                min='0'
                step='0.01'
                value={template.workers_comp_rate || ''}
                onChange={(e) =>
                  setTemplate((prev) => ({
                    ...prev,
                    workers_comp_rate: Number(e.target.value),
                  }))
                }
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='payrollTaxRate'>Payroll Tax Rate (%)</Label>
              <Input
                id='payrollTaxRate'
                type='number'
                min='0'
                step='0.01'
                value={template.payroll_tax_rate || ''}
                onChange={(e) =>
                  setTemplate((prev) => ({
                    ...prev,
                    payroll_tax_rate: Number(e.target.value),
                  }))
                }
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='trainingCostRate'>Training Cost Rate (%)</Label>
              <Input
                id='trainingCostRate'
                type='number'
                min='0'
                step='0.01'
                value={template.training_cost_rate || ''}
                onChange={(e) =>
                  setTemplate((prev) => ({
                    ...prev,
                    training_cost_rate: Number(e.target.value),
                  }))
                }
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='otherCostsRate'>Other Costs Rate (%)</Label>
              <Input
                id='otherCostsRate'
                type='number'
                min='0'
                step='0.01'
                value={template.other_costs_rate || ''}
                onChange={(e) =>
                  setTemplate((prev) => ({
                    ...prev,
                    other_costs_rate: Number(e.target.value),
                  }))
                }
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='fundingOffset'>Funding Offset</Label>
              <Input
                id='fundingOffset'
                type='number'
                min='0'
                step='0.01'
                value={template.funding_offset || ''}
                onChange={(e) =>
                  setTemplate((prev) => ({
                    ...prev,
                    funding_offset: Number(e.target.value),
                  }))
                }
              />
            </div>
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label>Effective From</Label>
              <DatePicker
                date={template.effective_from ? new Date(template.effective_from) : undefined}
                onSelect={handleEffectiveFromChange}
              />
            </div>

            <div className='space-y-2'>
              <Label>Effective To</Label>
              <DatePicker
                date={template.effective_to ? new Date(template.effective_to) : undefined}
                onSelect={handleEffectiveToChange}
              />
            </div>
          </div>

          <div className='pt-4'>
            <Button onClick={handleSave} disabled={loading} className='w-full'>
              {loading ? 'Saving...' : 'Save Template'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
