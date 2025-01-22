'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@auth0/nextjs-auth0/client'
import { ratesService } from '@/lib/services/rates'
import type { RateTemplate } from '@/lib/types/rates'
import type { ValidationResult } from '@/lib/types/validation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { DatePicker } from '@/components/ui/date-picker'
import { useToast } from '@/components/ui/use-toast'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export interface RateTemplateBuilderProps {
  templateId?: string
  onSave?: (template: RateTemplate) => void
}

const initialTemplate: RateTemplate = {
  id: '',
  org_id: '',
  template_name: '',
  template_type: 'hourly',
  description: '',
  effective_from: '',
  effective_to: '',
  base_rate: 0,
  base_margin: 0,
  super_rate: 0,
  leave_loading: 0,
  workers_comp_rate: 0,
  payroll_tax_rate: 0,
  training_cost_rate: 0,
  other_costs_rate: 0,
  funding_offset: 0,
  status: 'draft',
  version_number: 1,
  is_approved: false,
  created_at: '',
  updated_at: '',
}

export function RateTemplateBuilder({ templateId, onSave }: RateTemplateBuilderProps) {
  const [template, setTemplate] = useState<RateTemplate>(initialTemplate)
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const { user } = useUser()
  const { toast } = useToast()

  useEffect(() => {
    const loadTemplate = async () => {
      if (!templateId) return

      try {
        const loadedTemplate = await ratesService.getTemplate(templateId)
        if (loadedTemplate) {
          setTemplate(loadedTemplate)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load template')
      }
    }

    loadTemplate()
  }, [templateId])

  const validateTemplate = async () => {
    try {
      const result = await ratesService.validateRateTemplate(template)
      return result
    } catch (err) {
      return {
        isValid: false,
        errors: [err instanceof Error ? err.message : 'Validation failed'],
        warnings: [],
      }
    }
  }

  const handleSave = async () => {
    if (!user?.org_id) {
      toast({
        title: 'Error',
        description: 'User organization not found',
        variant: 'destructive',
      })
      return
    }

    try {
      setError(null)
      setIsSaving(true)

      const validation = await validateTemplate()
      if (!validation.isValid) {
        setError(validation.errors.join(', '))
        return
      }

      const fullTemplate: RateTemplate = {
        ...template,
        org_id: user.org_id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      const savedTemplate = await ratesService.saveTemplate(fullTemplate)
      toast({
        title: 'Success',
        description: 'Template saved successfully',
      })
      onSave?.(savedTemplate)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to save template')
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save template',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setTemplate((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleEffectiveFromChange = (date: React.SetStateAction<Date | undefined>) => {
    if (date instanceof Date) {
      setTemplate((prev) => ({
        ...prev,
        effective_from: date.toISOString(),
      }))
    }
  }

  const handleEffectiveToChange = (date: React.SetStateAction<Date | undefined>) => {
    if (date instanceof Date) {
      setTemplate((prev) => ({
        ...prev,
        effective_to: date.toISOString(),
      }))
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rate Template</CardTitle>
      </CardHeader>
      <CardContent>
        <form className='space-y-4'>
          <div>
            <Label htmlFor='templateName'>Template Name</Label>
            <Input
              id='templateName'
              name='template_name'
              value={template.template_name}
              onChange={handleInputChange}
            />
          </div>

          <div>
            <Label htmlFor='templateType'>Template Type</Label>
            <Select
              name='template_type'
              value={template.template_type}
              onValueChange={(value) =>
                setTemplate((prev) => ({
                  ...prev,
                  template_type: value as RateTemplate['template_type'],
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder='Select type' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='hourly'>Hourly</SelectItem>
                <SelectItem value='daily'>Daily</SelectItem>
                <SelectItem value='fixed'>Fixed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor='description'>Description</Label>
            <Input
              id='description'
              name='description'
              value={template.description}
              onChange={handleInputChange}
            />
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div>
              <Label>Effective From</Label>
              <DatePicker
                value={template.effective_from ? new Date(template.effective_from) : undefined}
                onSelect={handleEffectiveFromChange}
              />
            </div>
            <div>
              <Label>Effective To</Label>
              <DatePicker
                value={template.effective_to ? new Date(template.effective_to) : undefined}
                onSelect={handleEffectiveToChange}
              />
            </div>
          </div>

          <div>
            <Label htmlFor='baseRate'>Base Rate</Label>
            <Input
              id='baseRate'
              name='base_rate'
              type='number'
              value={template.base_rate}
              onChange={handleInputChange}
            />
          </div>

          <div>
            <Label htmlFor='baseMargin'>Base Margin (%)</Label>
            <Input
              id='baseMargin'
              name='base_margin'
              type='number'
              value={template.base_margin}
              onChange={handleInputChange}
            />
          </div>

          <div>
            <Label htmlFor='superRate'>Superannuation Rate (%)</Label>
            <Input
              id='superRate'
              name='super_rate'
              type='number'
              value={template.super_rate}
              onChange={handleInputChange}
            />
          </div>

          <div>
            <Label htmlFor='leaveLoading'>Leave Loading Rate (%)</Label>
            <Input
              id='leaveLoading'
              name='leave_loading'
              type='number'
              value={template.leave_loading}
              onChange={handleInputChange}
            />
          </div>

          <div>
            <Label htmlFor='workersCompRate'>Workers Comp Rate (%)</Label>
            <Input
              id='workersCompRate'
              name='workers_comp_rate'
              type='number'
              value={template.workers_comp_rate}
              onChange={handleInputChange}
            />
          </div>

          <div>
            <Label htmlFor='payrollTaxRate'>Payroll Tax Rate (%)</Label>
            <Input
              id='payrollTaxRate'
              name='payroll_tax_rate'
              type='number'
              value={template.payroll_tax_rate}
              onChange={handleInputChange}
            />
          </div>

          <div>
            <Label htmlFor='trainingCostRate'>Training Cost Rate (%)</Label>
            <Input
              id='trainingCostRate'
              name='training_cost_rate'
              type='number'
              value={template.training_cost_rate}
              onChange={handleInputChange}
            />
          </div>

          <div>
            <Label htmlFor='otherCostsRate'>Other Costs Rate (%)</Label>
            <Input
              id='otherCostsRate'
              name='other_costs_rate'
              type='number'
              value={template.other_costs_rate}
              onChange={handleInputChange}
            />
          </div>

          <div>
            <Label htmlFor='fundingOffset'>Funding Offset</Label>
            <Input
              id='fundingOffset'
              name='funding_offset'
              type='number'
              value={template.funding_offset}
              onChange={handleInputChange}
            />
          </div>

          {error && <div className='text-red-500'>{error}</div>}

          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Template'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
