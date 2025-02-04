import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { type RateTemplate } from '@/lib/types';

const rateTemplateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  templateType: z.enum(['hourly', 'daily', 'fixed']),
  description: z.string().optional(),
  baseRate: z.number().min(0),
  baseMargin: z.number().min(0),
  superRate: z.number().min(0),
  leaveLoading: z.number().min(0),
  workersCompRate: z.number().min(0),
  payrollTaxRate: z.number().min(0),
  trainingCostRate: z.number().min(0),
  otherCostsRate: z.number().min(0),
  fundingOffset: z.number().min(0),
  casualLoading: z.number().min(0),
  effectiveFrom: z.string(),
  effectiveTo: z.string().optional(),
});

type RateTemplateFormData = z.infer<typeof rateTemplateSchema>;

interface RateTemplateBuilderProps {
  template?: RateTemplate;
  onSubmit: (data: RateTemplateFormData) => Promise<void>;
  onSuccess?: () => void;
}

export function RateTemplateBuilder({
  template,
  onSubmit,
  onSuccess,
}: RateTemplateBuilderProps): JSX.Element {
  const form = useForm<RateTemplateFormData>({
    resolver: zodResolver(rateTemplateSchema),
    defaultValues: {
      name: '',
      templateType: 'hourly',
      description: '',
      baseRate: 0,
      baseMargin: 0,
      superRate: 0,
      leaveLoading: 0,
      workersCompRate: 0,
      payrollTaxRate: 0,
      trainingCostRate: 0,
      otherCostsRate: 0,
      fundingOffset: 0,
      casualLoading: 0,
      effectiveFrom: new Date().toISOString().split('T')[0],
    },
  });

  useEffect(() => {
    if (typeof template !== "undefined" && template !== null) {
      const formData: RateTemplateFormData = {
        name: template.name,
        templateType: template.templateType,
        description: template.description ?? '',
        baseRate: template.baseRate,
        baseMargin: template.baseMargin,
        superRate: template.superRate,
        leaveLoading: template.leaveLoading,
        workersCompRate: template.workersCompRate,
        payrollTaxRate: template.payrollTaxRate,
        trainingCostRate: template.trainingCostRate,
        otherCostsRate: template.otherCostsRate,
        fundingOffset: template.fundingOffset,
        casualLoading: template.casualLoading,
        effectiveFrom: template.effectiveFrom,
        effectiveTo: template.effectiveTo ?? undefined,
      };
      form.reset(formData);
    }
  }, [template, form.reset]);

  const handleSubmit = async (data: RateTemplateFormData): Promise<void> => {
    try {
      await onSubmit(data);
      if (typeof onSuccess !== "undefined" && onSuccess !== null) {
        onSuccess();
      }
    } catch (error) {
      console.error('Failed to submit template:', error);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
      {/* Form implementation */}
    </form>
  );
}
