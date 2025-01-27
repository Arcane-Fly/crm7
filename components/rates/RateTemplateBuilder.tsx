import { zodResolver } from '@hookform/resolvers/zod';
import type { SupabaseClient } from '@supabase/supabase-js';
import { type ReactElement } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { useToast } from '@/components/ui/use-toast';
import { useUser } from '@/lib/hooks/useUser';
import type { RateTemplate, RateTemplateStatus } from '@/lib/types/rates';

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
});

type RateTemplateFormData = z.infer<typeof rateTemplateSchema>;

interface RateTemplateBuilderProps {
  template?: RateTemplate;
  supabase: SupabaseClient;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function RateTemplateBuilder({
  template,
  supabase,
  onSuccess,
  onCancel,
}: RateTemplateBuilderProps): ReactElement {
  const { toast } = useToast();
  const { user } = useUser();

  const {
    register,
    handleSubmit: handleFormSubmit,
    reset,
    formState: { errors, isSubmitting },
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
    },
  });

  useEffect(() => {
    if (template) {
      reset(template);
    }
  }, [template, reset]);

  const onSubmit = async (data: RateTemplateFormData): Promise<void> => {
    try {
      const newTemplate: Partial<RateTemplate> = {
        ...data,
        orgId: user?.id as string,
        status: template?.status || 'draft',
        updatedBy: user?.id as string,
      };

      if (!template?.id) {
        const { error } = await supabase.from('rate_templates').insert([newTemplate]);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Rate template created successfully',
        });

        if (onSuccess) {
          onSuccess();
        }
      } else {
        const { error } = await supabase
          .from('rate_templates')
          .update(newTemplate)
          .eq('id', template.id);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Rate template updated successfully',
        });

        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (error) {
      console.error('Error saving template:', error);
      toast({
        title: 'Error',
        description: 'Failed to save rate template',
        variant: 'destructive',
      });
    }
  };

  return (
    <form
      onSubmit={handleFormSubmit(onSubmit)}
      className='space-y-6'
    >
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
        <div className='mb-4'>
          <label
            htmlFor='name'
            className='block text-sm font-medium text-gray-700'
          >
            Name
          </label>
          <input
            id='name'
            type='text'
            className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
            {...register('name')}
          />
          {errors.name && <p className='text-sm text-red-500'>{errors.name.message}</p>}
        </div>

        <div className='mb-4'>
          <label
            htmlFor='template_type'
            className='block text-sm font-medium text-gray-700'
          >
            Template Type
          </label>
          <select
            id='template_type'
            {...register('template_type')}
            className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
          >
            <option value='hourly'>Hourly</option>
            <option value='daily'>Daily</option>
            <option value='fixed'>Fixed</option>
          </select>
        </div>

        <div className='mb-4'>
          <label
            htmlFor='base_rate'
            className='block text-sm font-medium text-gray-700'
          >
            Base Rate
          </label>
          <input
            id='base_rate'
            type='number'
            step='0.01'
            {...register('base_rate', { valueAsNumber: true })}
            className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
          />
        </div>

        <div className='mb-4'>
          <label
            htmlFor='base_margin'
            className='block text-sm font-medium text-gray-700'
          >
            Base Margin (%)
          </label>
          <input
            id='base_margin'
            type='number'
            step='0.01'
            {...register('base_margin', { valueAsNumber: true })}
            className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
          />
        </div>

        <div className='mb-4'>
          <label
            htmlFor='super_rate'
            className='block text-sm font-medium text-gray-700'
          >
            Super Rate (%)
          </label>
          <input
            id='super_rate'
            type='number'
            step='0.01'
            {...register('super_rate', { valueAsNumber: true })}
            className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
          />
        </div>

        <div className='mb-4'>
          <label
            htmlFor='leave_loading'
            className='block text-sm font-medium text-gray-700'
          >
            Leave Loading (%)
          </label>
          <input
            id='leave_loading'
            type='number'
            step='0.01'
            {...register('leave_loading', { valueAsNumber: true })}
            className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
          />
        </div>

        <div className='mb-4'>
          <label
            htmlFor='workers_comp_rate'
            className='block text-sm font-medium text-gray-700'
          >
            Workers Comp Rate (%)
          </label>
          <input
            id='workers_comp_rate'
            type='number'
            step='0.01'
            {...register('workers_comp_rate', { valueAsNumber: true })}
            className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
          />
        </div>

        <div className='mb-4'>
          <label
            htmlFor='payroll_tax_rate'
            className='block text-sm font-medium text-gray-700'
          >
            Payroll Tax Rate (%)
          </label>
          <input
            id='payroll_tax_rate'
            type='number'
            step='0.01'
            {...register('payroll_tax_rate', { valueAsNumber: true })}
            className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
          />
        </div>

        <div className='mb-4'>
          <label
            htmlFor='training_cost_rate'
            className='block text-sm font-medium text-gray-700'
          >
            Training Cost Rate (%)
          </label>
          <input
            id='training_cost_rate'
            type='number'
            step='0.01'
            {...register('training_cost_rate', { valueAsNumber: true })}
            className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
          />
        </div>

        <div className='mb-4'>
          <label
            htmlFor='other_costs_rate'
            className='block text-sm font-medium text-gray-700'
          >
            Other Costs Rate (%)
          </label>
          <input
            id='other_costs_rate'
            type='number'
            step='0.01'
            {...register('other_costs_rate', { valueAsNumber: true })}
            className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
          />
        </div>

        <div className='mb-4'>
          <label
            htmlFor='funding_offset'
            className='block text-sm font-medium text-gray-700'
          >
            Funding Offset
          </label>
          <input
            id='funding_offset'
            type='number'
            step='0.01'
            {...register('funding_offset', { valueAsNumber: true })}
            className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
          />
        </div>

        <div className='mb-4'>
          <label
            htmlFor='effective_from'
            className='block text-sm font-medium text-gray-700'
          >
            Effective From
          </label>
          <input
            id='effective_from'
            type='date'
            {...register('effective_from')}
            className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
          />
        </div>

        <div className='mb-4'>
          <label
            htmlFor='effective_to'
            className='block text-sm font-medium text-gray-700'
          >
            Effective To
          </label>
          <input
            id='effective_to'
            type='date'
            {...register('effective_to')}
            className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
          />
        </div>

        <div className='col-span-2 mb-4'>
          <label
            htmlFor='description'
            className='block text-sm font-medium text-gray-700'
          >
            Description
          </label>
          <textarea
            id='description'
            {...register('description')}
            className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
            rows={3}
          />
        </div>
      </div>

      <div className='flex justify-end space-x-4'>
        {onCancel && (
          <button
            type='button'
            onClick={onCancel}
            className='rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200'
          >
            Cancel
          </button>
        )}
        <button
          type='submit'
          disabled={isSubmitting}
          className='rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50'
        >
          {isSubmitting ? 'Saving...' : template ? 'Update' : 'Create'}
        </button>
      </div>
    </form>
  );
}
