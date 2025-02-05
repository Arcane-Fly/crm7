import { useState, useEffect } from 'react';
import { type CalculationResult } from '@/lib/types/rates';
import { useToast } from '@/components/ui/use-toast';
import { useSupabase } from '@/lib/supabase/supabase-provider';

interface RateCalculatorProps {
  orgId: string;
  onCalculate?: (totalAmount: number) => void;
}

export function RateCalculator({ orgId, onCalculate }: RateCalculatorProps): JSX.Element {
  const { supabase } = useSupabase();
  const { toast } = useToast();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [rate, setRate] = useState<number>(0);
  const [multiplier, setMultiplier] = useState<number>(1);

  const calculateRate = (template: unknown): void => {
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

    const result = {
      baseAmount: Number(baseAmount.toFixed(2)),
      superAmount: Number(superAmount.toFixed(2)),
      leaveAmount: Number(leaveAmount.toFixed(2)),
      workersCompAmount: Number(workersCompAmount.toFixed(2)),
      payrollTaxAmount: Number(payrollTaxAmount.toFixed(2)),
      trainingAmount: Number(trainingAmount.toFixed(2)),
      otherAmount: Number(otherAmount.toFixed(2)),
      totalAmount,
    };

    onCalculate?.(totalAmount);
  };

  const handleTemplateChange = (value: string): void => {
    const template = templates?.find((t) => t.id === value);
    if (typeof template !== "undefined" && template !== null) {
      calculateRate(template);
    }
  };

  useEffect((): void => {
    const fetchTemplates = async (): Promise<void> => {
      try {
        const { data, error } = await supabase
          .from('rate_templates')
          .select('*')
          .eq('org_id', orgId)
          .eq('status', 'active');

        if (typeof error !== "undefined" && error !== null) throw error;

        setTemplates(data);
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
  }, [orgId, supabase, toast]);

  if (typeof loading !== "undefined" && loading !== null) return <div>Loading templates...</div>;
  if (typeof error !== "undefined" && error !== null) return <div className="text-red-500">{error}</div>;

  return (
    <div className="space-y-6">
      {/* Component implementation */}
    </div>
  );
}
