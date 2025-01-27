import { useState, useEffect } from 'react';

import { Combobox } from '@/components/ui/combobox';
import { useToast } from '@/components/ui/use-toast';
import { useSupabase } from '@/lib/supabase/supabase-provider';
import type { RateTemplate } from '@/lib/types/rates';

interface RateComparisonProps {
  selectedTemplates?: RateTemplate[];
  onTemplateSelect?: (templates: RateTemplate[]) => void;
  maxSelections?: number;
}

export default function RateComparison({
  selectedTemplates = [],
  onTemplateSelect,
  maxSelections = 3,
}: RateComparisonProps) {
  const { supabase } = useSupabase();
  const { toast } = useToast();
  const [templates, setTemplates] = useState<RateTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTemplates() {
      try {
        const { data, error } = await supabase
          .from('rate_templates')
          .select('*')
          .order('created_at', { ascending: false });

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
    }

    fetchTemplates();
  }, [supabase, toast]);

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find((t) => t.id === templateId);
    if (!template) return;

    const newSelection = selectedTemplates.some((t) => t.id === templateId)
      ? selectedTemplates.filter((t) => t.id !== templateId)
      : [...selectedTemplates, template];

    if (newSelection.length > maxSelections) {
      toast({
        title: 'Selection Limit',
        description: `You can select up to ${maxSelections} templates for comparison`,
        variant: 'destructive',
      });
      return;
    }

    onTemplateSelect?.(newSelection);
  };

  if (loading) return <div>Loading templates...</div>;
  if (error) return <div className='text-red-500'>{error}</div>;

  const templateOptions = templates.map((template) => ({
    label: template.name,
    value: template.id,
  }));

  const calculateDifference = (value1: number, value2: number): string => {
    const diff = value1 - value2;
    const percentage = (diff / value2) * 100;
    return `${diff >= 0 ? '+' : ''}${percentage.toFixed(2)}%`;
  };

  return (
    <div className='space-y-6'>
      <div className='space-y-2'>
        <label className='text-sm font-medium'>Select Templates to Compare</label>
        <Combobox
          options={templateOptions}
          value={selectedTemplates.map((t) => t.id)}
          onChange={handleTemplateSelect}
          placeholder='Select templates...'
          multiple
        />
        <p className='text-sm text-gray-500'>Select up to {maxSelections} templates to compare</p>
      </div>

      {selectedTemplates.length > 0 && (
        <div className='overflow-x-auto'>
          <table className='min-w-full divide-y divide-gray-200'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                  Rate Component
                </th>
                {selectedTemplates.map((template, index) => (
                  <th
                    key={template.id}
                    className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'
                  >
                    {template.name}
                    {index > 0 && (
                      <span className='block text-xs font-normal'>(vs Template {index})</span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-200 bg-white'>
              {[
                { key: 'base_rate', label: 'Base Rate' },
                { key: 'base_margin', label: 'Base Margin' },
                { key: 'super_rate', label: 'Super Rate' },
                { key: 'leave_loading', label: 'Leave Loading' },
                { key: 'workers_comp_rate', label: 'Workers Comp Rate' },
                { key: 'payroll_tax_rate', label: 'Payroll Tax Rate' },
                { key: 'training_cost_rate', label: 'Training Cost Rate' },
                { key: 'other_costs_rate', label: 'Other Costs Rate' },
                { key: 'funding_offset', label: 'Funding Offset' },
              ].map(({ key, label }) => (
                <tr key={key}>
                  <td className='whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900'>
                    {label}
                  </td>
                  {selectedTemplates.map((template, index) => (
                    <td
                      key={template.id}
                      className='whitespace-nowrap px-6 py-4 text-sm text-gray-500'
                    >
                      {template[key as keyof RateTemplate]}
                      {index > 0 && (
                        <span
                          className={`ml-2 text-xs ${
                            Number(template[key as keyof RateTemplate]) >=
                            Number(selectedTemplates[0][key as keyof RateTemplate])
                              ? 'text-green-600'
                              : 'text-red-600'
                          }`}
                        >
                          {calculateDifference(
                            Number(template[key as keyof RateTemplate]),
                            Number(selectedTemplates[0][key as keyof RateTemplate]),
                          )}
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
