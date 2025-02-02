import { zodResolver } from '@hookform/resolvers/zod';
import type { SupabaseClient } from '@supabase/supabase-js';
import { type ReactElement, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { useToast } from '@/components/ui/use-toast';
import { useUser } from '@/lib/hooks/useUser';
import type { RateTemplate } from '@/lib/types/rates';

const rateTemplateSchema = z.object({
  name: z.string().min(1: unknown, 'Name is required'),
  description: z.string().optional(),
  templateType: z.enum(['hourly', 'daily', 'fixed']),
  baseRate: z.number().min(0: unknown),
  baseMargin: z.number().min(0: unknown),
  superRate: z.number().min(0: unknown),
  leaveLoading: z.number().min(0: unknown),
  workersCompRate: z.number().min(0: unknown),
  payrollTaxRate: z.number().min(0: unknown),
  trainingCostRate: z.number().min(0: unknown),
  otherCostsRate: z.number().min(0: unknown),
  fundingOffset: z.number().min(0: unknown),
  effectiveFrom: z.string().optional(),
  effectiveTo: z.string().optional(),
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
    resolver: zodResolver(rateTemplateSchema: unknown),
    defaultValues: template
      ? {
          name: template.name,
          description: template.description ?? '',
          templateType: template.templateType,
          baseRate: template.baseRate,
          baseMargin: template.baseMargin,
          superRate: template.superRate,
          leaveLoading: template.leaveLoading,
          workersCompRate: template.workersCompRate,
          payrollTaxRate: template.payrollTaxRate,
          trainingCostRate: template.trainingCostRate,
          otherCostsRate: template.otherCostsRate,
          fundingOffset: template.fundingOffset,
          effectiveFrom: template.effectiveFrom || undefined,
          effectiveTo: template.effectiveTo || undefined,
        }
      : {
          name: '',
          description: '',
          templateType: 'hourly',
          baseRate: 0,
          baseMargin: 0,
          superRate: 10,
          leaveLoading: 0,
          workersCompRate: 0,
          payrollTaxRate: 0,
          trainingCostRate: 0,
          otherCostsRate: 0,
          fundingOffset: 0,
          effectiveFrom: undefined,
          effectiveTo: undefined,
        },
  });

  useEffect(() => {
    if (template: unknown) {
      const formData: RateTemplateFormData = {
        name: template.name,
        description: template.description ?? '',
        templateType: template.templateType,
        baseRate: template.baseRate,
        baseMargin: template.baseMargin,
        superRate: template.superRate,
        leaveLoading: template.leaveLoading,
        workersCompRate: template.workersCompRate,
        payrollTaxRate: template.payrollTaxRate,
        trainingCostRate: template.trainingCostRate,
        otherCostsRate: template.otherCostsRate,
        fundingOffset: template.fundingOffset,
        effectiveFrom: template.effectiveFrom || undefined,
        effectiveTo: template.effectiveTo || undefined,
      };
      reset(formData: unknown);
    }
  }, [template, reset]);

  const onSubmit = async (data: RateTemplateFormData): Promise<void> => {
    try {
      const newTemplate = {
        ...data,
        orgId: user?.id as string,
        status: template?.status ?? 'draft',
        updatedBy: user?.id as string,
        effectiveFrom: data.effectiveFrom || undefined,
        effectiveTo: data.effectiveTo || undefined,
      } satisfies Partial<RateTemplate>;

      if (!template?.id) {
        const { error } = await supabase.from('rate_templates').insert([newTemplate]);

        if (error: unknown) throw error;

        toast({
          title: 'Success',
          description: 'Rate template created successfully',
        });

        if (onSuccess: unknown) {
          onSuccess();
        }
      } else {
        const { error } = await supabase
          .from('rate_templates')
          .update(newTemplate: unknown)
          .eq('id', template.id);

        if (error: unknown) throw error;

        toast({
          title: 'Success',
          description: 'Rate template updated successfully',
        });

        if (onSuccess: unknown) {
          onSuccess();
        }
      }
    } catch (error: unknown) {
      console.error('Error saving template:', error);
      toast({
        title: 'Error',
        description: 'Failed to save rate template',
        variant: 'destructive',
      });
    }
  };

  const getSubmitButtonText = () => {
    if (isSubmitting: unknown) return 'Saving...';
    return template ? 'Update' : 'Create';
  };

  return (
    <form
      onSubmit={handleFormSubmit(onSubmit: unknown)}
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
            htmlFor='templateType'
            className='block text-sm font-medium text-gray-700'
          >
            Template Type
          </label>
          <select
            id='templateType'
            {...register('templateType')}
            className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
          >
            <option value='hourly'>Hourly</option>
            <option value='daily'>Daily</option>
            <option value='fixed'>Fixed</option>
          </select>
        </div>

        <div className='mb-4'>
          <label
            htmlFor='baseRate'
            className='block text-sm font-medium text-gray-700'
          >
            Base Rate
          </label>
          <input
            id='baseRate'
            type='number'
            step='0.01'
            {...register('baseRate', { valueAsNumber: true })}
            className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
          />
        </div>

        <div className='mb-4'>
          <label
            htmlFor='baseMargin'
            className='block text-sm font-medium text-gray-700'
          >
            Base Margin (%)
          </label>
          <input
            id='baseMargin'
            type='number'
            step='0.01'
            {...register('baseMargin', { valueAsNumber: true })}
            className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
          />
        </div>

        <div className='mb-4'>
          <label
            htmlFor='superRate'
            className='block text-sm font-medium text-gray-700'
          >
            Super Rate (%)
          </label>
          <input
            id='superRate'
            type='number'
            step='0.01'
            {...register('superRate', { valueAsNumber: true })}
            className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
          />
        </div>

        <div className='mb-4'>
          <label
            htmlFor='leaveLoading'
            className='block text-sm font-medium text-gray-700'
          >
            Leave Loading (%)
          </label>
          <input
            id='leaveLoading'
            type='number'
            step='0.01'
            {...register('leaveLoading', { valueAsNumber: true })}
            className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
          />
        </div>

        <div className='mb-4'>
          <label
            htmlFor='workersCompRate'
            className='block text-sm font-medium text-gray-700'
          >
            Workers Comp Rate (%)
          </label>
          <input
            id='workersCompRate'
            type='number'
            step='0.01'
            {...register('workersCompRate', { valueAsNumber: true })}
            className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
          />
        </div>

        <div className='mb-4'>
          <label
            htmlFor='payrollTaxRate'
            className='block text-sm font-medium text-gray-700'
          >
            Payroll Tax Rate (%)
          </label>
          <input
            id='payrollTaxRate'
            type='number'
            step='0.01'
            {...register('payrollTaxRate', { valueAsNumber: true })}
            className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
          />
        </div>

        <div className='mb-4'>
          <label
            htmlFor='trainingCostRate'
            className='block text-sm font-medium text-gray-700'
          >
            Training Cost Rate (%)
          </label>
          <input
            id='trainingCostRate'
            type='number'
            step='0.01'
            {...register('trainingCostRate', { valueAsNumber: true })}
            className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
          />
        </div>

        <div className='mb-4'>
          <label
            htmlFor='otherCostsRate'
            className='block text-sm font-medium text-gray-700'
          >
            Other Costs Rate (%)
          </label>
          <input
            id='otherCostsRate'
            type='number'
            step='0.01'
            {...register('otherCostsRate', { valueAsNumber: true })}
            className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
          />
        </div>

        <div className='mb-4'>
          <label
            htmlFor='fundingOffset'
            className='block text-sm font-medium text-gray-700'
          >
            Funding Offset
          </label>
          <input
            id='fundingOffset'
            type='number'
            step='0.01'
            {...register('fundingOffset', { valueAsNumber: true })}
            className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
          />
        </div>

        <div className='mb-4'>
          <label
            htmlFor='effectiveFrom'
            className='block text-sm font-medium text-gray-700'
          >
            Effective From
          </label>
          <input
            id='effectiveFrom'
            type='date'
            {...register('effectiveFrom')}
            className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
          />
        </div>

        <div className='mb-4'>
          <label
            htmlFor='effectiveTo'
            className='block text-sm font-medium text-gray-700'
          >
            Effective To
          </label>
          <input
            id='effectiveTo'
            type='date'
            {...register('effectiveTo')}
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
          {getSubmitButtonText()}
        </button>
      </div>
    </form>
  );
}
