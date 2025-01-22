import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useToast } from '@/components/ui/use-toast'
import { RateTemplate, RateTemplateStatus } from '@/lib/types/rates'
import { useSupabase } from '@/lib/supabase/supabase-provider'
import { useUser } from '@/lib/hooks/useUser'

const rateTemplateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  template_type: z.enum(['hourly', 'daily', 'fixed']),
  base_rate: z.number().min(0),
  base_margin: z.number().min(0),
  super_rate: z.number().min(0),
  leave_loading: z.number().min(0),
  workers_comp_rate: z.number().min(0),
  payroll_tax_rate: z.number().min(0),
  training_cost_rate: z.number().min(0),
  other_costs_rate: z.number().min(0),
  funding_offset: z.number().min(0),
  effective_from: z.string().nullable(),
  effective_to: z.string().nullable(),
})

type RateTemplateFormData = z.infer<typeof rateTemplateSchema>

interface RateTemplateBuilderProps {
  template?: RateTemplate
  onSave?: (template: RateTemplate) => void
  onCancel?: () => void
}

export function RateTemplateBuilder({
  template,
  onSave,
  onCancel
}: RateTemplateBuilderProps) {
  const { supabase } = useSupabase()
  const { user } = useUser()
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<RateTemplateFormData>({
    resolver: zodResolver(rateTemplateSchema),
    defaultValues: template || {
      name: '',
      description: '',
      template_type: 'hourly',
      base_rate: 0,
      base_margin: 0,
      super_rate: 10,
      leave_loading: 0,
      workers_comp_rate: 0,
      payroll_tax_rate: 0,
      training_cost_rate: 0,
      other_costs_rate: 0,
      funding_offset: 0,
      effective_from: null,
      effective_to: null,
    }
  })

  useEffect(() => {
    if (template) {
      reset(template)
    }
  }, [template, reset])

  const onSubmit = async (data: RateTemplateFormData) => {
    try {
      const newTemplate: Partial<RateTemplate> = {
        ...data,
        org_id: user?.org_id as string,
        status: template?.status || RateTemplateStatus.Draft,
        updated_by: user?.id as string,
      }

      if (!template?.id) {
        const { data: savedTemplate, error } = await supabase
          .from('rate_templates')
          .insert([newTemplate])
          .select()
          .single()

        if (error) throw error
        
        toast({
          title: 'Success',
          description: 'Rate template created successfully',
        })
        
        if (onSave && savedTemplate) {
          onSave(savedTemplate as RateTemplate)
        }
      } else {
        const { data: updatedTemplate, error } = await supabase
          .from('rate_templates')
          .update(newTemplate)
          .eq('id', template.id)
          .select()
          .single()

        if (error) throw error
        
        toast({
          title: 'Success',
          description: 'Rate template updated successfully',
        })
        
        if (onSave && updatedTemplate) {
          onSave(updatedTemplate as RateTemplate)
        }
      }
    } catch (error) {
      console.error('Error saving template:', error)
      toast({
        title: 'Error',
        description: 'Failed to save rate template',
        variant: 'destructive',
      })
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium">Name</label>
          <input
            type="text"
            {...register('name')}
            className="w-full rounded-md border p-2"
          />
          {errors.name && (
            <p className="text-sm text-red-500">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Template Type</label>
          <select
            {...register('template_type')}
            className="w-full rounded-md border p-2"
          >
            <option value="hourly">Hourly</option>
            <option value="daily">Daily</option>
            <option value="fixed">Fixed</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Base Rate</label>
          <input
            type="number"
            step="0.01"
            {...register('base_rate', { valueAsNumber: true })}
            className="w-full rounded-md border p-2"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Base Margin (%)</label>
          <input
            type="number"
            step="0.01"
            {...register('base_margin', { valueAsNumber: true })}
            className="w-full rounded-md border p-2"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Super Rate (%)</label>
          <input
            type="number"
            step="0.01"
            {...register('super_rate', { valueAsNumber: true })}
            className="w-full rounded-md border p-2"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Leave Loading (%)</label>
          <input
            type="number"
            step="0.01"
            {...register('leave_loading', { valueAsNumber: true })}
            className="w-full rounded-md border p-2"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Workers Comp Rate (%)</label>
          <input
            type="number"
            step="0.01"
            {...register('workers_comp_rate', { valueAsNumber: true })}
            className="w-full rounded-md border p-2"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Payroll Tax Rate (%)</label>
          <input
            type="number"
            step="0.01"
            {...register('payroll_tax_rate', { valueAsNumber: true })}
            className="w-full rounded-md border p-2"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Training Cost Rate (%)</label>
          <input
            type="number"
            step="0.01"
            {...register('training_cost_rate', { valueAsNumber: true })}
            className="w-full rounded-md border p-2"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Other Costs Rate (%)</label>
          <input
            type="number"
            step="0.01"
            {...register('other_costs_rate', { valueAsNumber: true })}
            className="w-full rounded-md border p-2"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Funding Offset</label>
          <input
            type="number"
            step="0.01"
            {...register('funding_offset', { valueAsNumber: true })}
            className="w-full rounded-md border p-2"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Effective From</label>
          <input
            type="date"
            {...register('effective_from')}
            className="w-full rounded-md border p-2"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Effective To</label>
          <input
            type="date"
            {...register('effective_to')}
            className="w-full rounded-md border p-2"
          />
        </div>

        <div className="col-span-2 space-y-2">
          <label className="text-sm font-medium">Description</label>
          <textarea
            {...register('description')}
            className="w-full rounded-md border p-2"
            rows={3}
          />
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : template ? 'Update' : 'Create'}
        </button>
      </div>
    </form>
  )
}
