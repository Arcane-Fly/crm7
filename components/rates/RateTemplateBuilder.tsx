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
import type { RateTemplate, AwardRate } from '@/lib/services/rates'
import { ratesService } from '@/lib/services/rates'
import { DatePicker } from '@/components/ui/date-picker'

export interface RateTemplateBuilderProps {
  templateId?: string
  onSave?: (template: RateTemplate) => void
}

export function RateTemplateBuilder({ templateId, onSave }: RateTemplateBuilderProps) {
  const { toast } = useToast()
  const { user } = useUser()
  const [loading, setLoading] = useState(false)
  const [awards, setAwards] = useState<AwardRate[]>([])
  const [template, setTemplate] = useState<Partial<RateTemplate>>({
    template_type: 'apprentice',
    is_active: true,
    rules: {},
  })
  const [errors, setErrors] = useState<string[]>([])

  const loadAwards = useCallback(async () => {
    try {
      const data = await ratesService.getAwardRates({
        effective_date: new Date(),
      })
      setAwards(data)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load awards',
        variant: 'destructive',
      })
    }
  }, [toast])

  const loadTemplate = useCallback(async () => {
    if (!templateId) return
    try {
      const data = await ratesService.getRateTemplates({
        org_id: user!.org_id,
      })
      const found = data.find((t) => t.id === templateId)
      if (found) {
        setTemplate(found)
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
    const loadData = async () => {
      if (user?.org_id) {
        await Promise.all([loadAwards(), loadTemplate()])
      }
    }
    loadData()
  }, [loadAwards, loadTemplate, user])

  const handleSave = async () => {
    try {
      setLoading(true)
      setErrors([])

      const validation = await ratesService.validateRateTemplate(template)
      if (!validation.isValid) {
        setErrors(validation.errors)
        return
      }

      const fullTemplate: RateTemplate = {
        ...(template as RateTemplate),
        org_id: user!.org_id,
      }

      const { data, error } = await ratesService.supabase
        .from('rate_templates')
        .upsert(fullTemplate)
        .select()
        .single()

      if (error) throw error

      toast({
        title: 'Success',
        description: 'Rate template saved successfully',
      })

      onSave?.(data)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save template',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

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

          <div className='space-y-2'>
            <Label htmlFor='award'>Award</Label>
            <Select
              value={template.award_id}
              onValueChange={(value) =>
                setTemplate((prev) => ({
                  ...prev,
                  award_id: value,
                }))
              }
            >
              <SelectTrigger id='award'>
                <SelectValue placeholder='Select an award' />
              </SelectTrigger>
              <SelectContent>
                {awards.map((award) => (
                  <SelectItem key={award.id} value={award.id}>
                    {award.award_name}
                  </SelectItem>
                ))}
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
                onSelect={(date) =>
                  setTemplate((prev) => ({
                    ...prev,
                    effective_from: date,
                  }))
                }
              />
            </div>

            <div className='space-y-2'>
              <Label>Effective To</Label>
              <DatePicker
                date={template.effective_to ? new Date(template.effective_to) : undefined}
                onSelect={(date) =>
                  setTemplate((prev) => ({
                    ...prev,
                    effective_to: date,
                  }))
                }
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
