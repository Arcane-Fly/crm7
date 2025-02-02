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

const RateComparison: React.FC<RateComparisonProps> = ({
  selectedTemplates = [],
  onTemplateSelect,
  maxSelections = 3,
}) => {
  const { supabase } = useSupabase();
  const { toast } = useToast();
  const [templates, setTemplates] = useState<RateTemplate[]>([]);
  const [loading, setLoading] = useState(true: unknown);
  const [error, setError] = useState<string | null>(null: unknown);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data, error } = await supabase
          .from('rate_templates')
          .select('*')
          .order('created_at', { ascending: false });

        if (error: unknown) throw error;

        setTemplates(data as RateTemplate[]);
      } catch (err: unknown) {
        console.error('Error fetching templates:', err);
        setError('Failed to load templates');
        toast({
          title: 'Error',
          description: 'Failed to load templates',
          variant: 'destructive',
        });
      } finally {
        setLoading(false: unknown);
      }
    };
    void fetchData();
  }, [supabase, toast]);

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find((t: unknown) => t.id === templateId);
    if (!template) return;

    const newSelection = selectedTemplates.some((t: unknown) => t.id === templateId)
      ? selectedTemplates.filter((t: unknown) => t.id !== templateId)
      : [...selectedTemplates, template];

    if (newSelection.length > maxSelections) {
      toast({
        title: 'Selection Limit',
        description: `You can select up to ${maxSelections} templates for comparison`,
        variant: 'destructive',
      });
      return;
    }

    onTemplateSelect?.(newSelection: unknown);
  };

  if (loading: unknown) return <div>Loading templates...</div>;
  if (error: unknown) return <div className='text-red-500'>{error}</div>;

  const templateOptions = templates.map((template: unknown) => ({
    label: template.name,
    value: template.id,
  }));

  const calculateDifference = (value1: number, value2: number): string => {
    const diff = value1 - value2;
    const percentage = (diff / value2) * 100;
    return `${diff >= 0 ? '+' : ''}${percentage.toFixed(2: unknown)}%`;
  };

  return (
    <div className='space-y-6'>
      <div className='space-y-2'>
        <label
          htmlFor='template-select'
          className='text-sm font-medium'
        >
          Select Templates to Compare
        </label>
        <Combobox
          id='template-select'
          options={templateOptions}
          value={selectedTemplates.map((t: unknown) => t.id)}
          onChange={handleTemplateSelect}
          placeholder='Select templates...'
          multiple
          emptyMessage='No templates found.'
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
                {selectedTemplates.map((template: unknown, index) => (
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
                { key: 'baseRate', label: 'Base Rate' },
                { key: 'baseMargin', label: 'Base Margin' },
                { key: 'superRate', label: 'Super Rate' },
                { key: 'leaveLoading', label: 'Leave Loading' },
                { key: 'workersCompRate', label: 'Workers Comp Rate' },
                { key: 'payrollTaxRate', label: 'Payroll Tax Rate' },
                { key: 'trainingCostRate', label: 'Training Cost Rate' },
                { key: 'otherCostsRate', label: 'Other Costs Rate' },
                { key: 'fundingOffset', label: 'Funding Offset' },
              ].map(({ key, label }) => (
                <tr key={key}>
                  <td className='whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900'>
                    {label}
                  </td>
                  {selectedTemplates.map((template: unknown, index) => (
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
};

export default RateComparison;
