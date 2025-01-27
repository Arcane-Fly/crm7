import React, { useEffect, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import { ErrorFallback } from '@/components/error/ErrorFallback';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { useSupabase } from '@/lib/supabase/supabase-provider';
import type { RateTemplate } from '@/lib/types/rates';

import type { CalculationResult, RateCalculatorProps } from './types';

export function RateCalculator({ orgId, onCalculate }: RateCalculatorProps): JSX.Element {
  const { supabase } = useSupabase();
  const { toast } = useToast();
  const [templates, setTemplates] = useState<RateTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CalculationResult | null>(null);

  const calculateRate = (template: RateTemplate): void => {
    const baseAmount = template.baseRate * (1 + template.baseMargin / 100);
    const superAmount = baseAmount * (template.superRate / 100);
    const leaveAmount = baseAmount * (template.leaveLoading / 100);
    const workersCompAmount = baseAmount * (template.workersCompRate / 100);
    const payrollTaxAmount = baseAmount * (template.payrollTaxRate / 100);
    const trainingAmount = baseAmount * (template.trainingCostRate / 100);
    const otherAmount = baseAmount * (template.otherCostsRate / 100);

    const totalAmount = Number(
      (
        baseAmount +
        superAmount +
        leaveAmount +
        workersCompAmount +
        payrollTaxAmount +
        trainingAmount +
        otherAmount -
        template.fundingOffset
      ).toFixed(2),
    );

    const result: CalculationResult = {
      baseAmount: Number(baseAmount.toFixed(2)),
      superAmount: Number(superAmount.toFixed(2)),
      leaveAmount: Number(leaveAmount.toFixed(2)),
      workersCompAmount: Number(workersCompAmount.toFixed(2)),
      payrollTaxAmount: Number(payrollTaxAmount.toFixed(2)),
      trainingAmount: Number(trainingAmount.toFixed(2)),
      otherAmount: Number(otherAmount.toFixed(2)),
      totalAmount,
    };

    setResult(result);
    onCalculate?.(totalAmount);
  };

  const handleTemplateChange = (value: string): void => {
    setSelectedTemplate(value);
    const template = templates.find((t) => t.id === value);
    if (template) {
      calculateRate(template);
    }
  };

  useEffect(() => {
    const fetchTemplates = async (): Promise<void> => {
      try {
        const { data, error } = await supabase
          .from('rate_templates')
          .select('*')
          .eq('orgId', orgId)
          .order('createdAt', { ascending: false });

        if (error) throw error;

        setTemplates(data as RateTemplate[]);
      } catch (err) {
        console.error('Error fetching templates:', err);
        setError('Failed to load templates');
        toast({
          title: 'Error',
          description: 'Failed to load templates',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    void fetchTemplates();
  }, [orgId, supabase, toast]);

  if (loading) return <div>Loading templates...</div>;
  if (error) return <div className='text-red-500'>{error}</div>;

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <div className='space-y-6'>
        <div className='space-y-4'>
          <div className='space-y-2'>
            <label
              htmlFor='template'
              className='text-sm font-medium'
            >
              Select Rate Template
            </label>
            <Select
              value={selectedTemplate}
              onValueChange={handleTemplateChange}
            >
              <SelectTrigger>
                <SelectValue placeholder='Choose a template' />
              </SelectTrigger>
              <SelectContent>
                {templates.map((template) => (
                  <SelectItem
                    key={template.id}
                    value={template.id}
                  >
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {result && (
          <div className='space-y-4'>
            <h3 className='text-lg font-medium'>Calculation Result</h3>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <span className='text-sm text-gray-500'>Base Amount</span>
                <p className='text-lg font-medium'>${result.baseAmount}</p>
              </div>
              <div>
                <span className='text-sm text-gray-500'>Super</span>
                <p className='text-lg font-medium'>${result.superAmount}</p>
              </div>
              <div>
                <span className='text-sm text-gray-500'>Leave Loading</span>
                <p className='text-lg font-medium'>${result.leaveAmount}</p>
              </div>
              <div>
                <span className='text-sm text-gray-500'>Workers Comp</span>
                <p className='text-lg font-medium'>${result.workersCompAmount}</p>
              </div>
              <div>
                <span className='text-sm text-gray-500'>Payroll Tax</span>
                <p className='text-lg font-medium'>${result.payrollTaxAmount}</p>
              </div>
              <div>
                <span className='text-sm text-gray-500'>Training</span>
                <p className='text-lg font-medium'>${result.trainingAmount}</p>
              </div>
              <div>
                <span className='text-sm text-gray-500'>Other Costs</span>
                <p className='text-lg font-medium'>${result.otherAmount}</p>
              </div>
              <div>
                <span className='text-sm font-bold text-gray-500'>Total Amount</span>
                <p className='text-lg font-bold'>${result.totalAmount}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}
