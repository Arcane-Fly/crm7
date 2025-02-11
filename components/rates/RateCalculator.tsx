import { useToast } from '@/hooks/use-toast';
import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import type { RateTemplate } from '@/lib/types/rates';

interface RateCalculatorProps {
  orgId: string;
  onCalculate?: (totalAmount: number) => void;
}

export function RateCalculator({ orgId, onCalculate }: RateCalculatorProps): React.ReactElement {
  const [templates, setTemplates] = useState<RateTemplate[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const supabaseClient = createClient();
  const { toast } = useToast();

  const calculateRate = (template: RateTemplate): void => {
    const baseAmount = template.baseRate;
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
        otherAmount
      ).toFixed(2)
    );

    onCalculate?.(totalAmount);
  };

  useEffect((): void => {
    const fetchTemplates = async (): Promise<void> => {
      try {
        const { data, error } = await supabaseClient
          .from('rate_templates')
          .select('*')
          .eq('org_id', orgId)
          .eq('status', 'active');

        if (error) throw error;

        setTemplates(data || []);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch templates';
        setError(errorMessage);
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    void fetchTemplates();
  }, [orgId, supabaseClient, toast]);

  if (loading) return <div>Loading templates...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="space-y-6">
      {templates.map((template) => (
        <div key={template.id} className="p-4 border rounded-lg">
          <h3 className="text-lg font-semibold">{template.name}</h3>
          <p className="text-sm text-muted-foreground">{template.description}</p>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <span className="text-sm font-medium">Base Rate:</span>
              <span className="ml-2">${template.baseRate.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-sm font-medium">Super Rate:</span>
              <span className="ml-2">{template.superRate}%</span>
            </div>
            {/* Add more rate details as needed */}
          </div>
          <button
            onClick={() => calculateRate(template)}
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Calculate Rate
          </button>
        </div>
      ))}
    </div>
  );
}
