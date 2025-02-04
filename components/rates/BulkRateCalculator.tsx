import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { type ReactElement } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { ratesService } from '@/lib/services/rates';
import { type BulkCalculation, type RateTemplate } from '@/lib/types/rates';

interface BulkRateCalculatorProps {
  orgId?: string;
}

export function BulkRateCalculator({ orgId = 'default-org' }: BulkRateCalculatorProps): JSX.Element {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: templatesData } = useQuery({
    queryKey: ['templates', orgId],
    queryFn: () => ratesService.getTemplates({ orgId }),
  });

  const { data: calculationsData, isLoading } = useQuery({
    queryKey: ['bulk-calculations', orgId],
    queryFn: () => ratesService.getBulkCalculations(orgId),
  });

  const createCalculation = useMutation({
    mutationFn: async () => {
      if (!templatesData?.data) {
        throw new Error('No templates available');
      }
      const templateIds = templatesData.data.slice(0, 2).map(t => t.id);
      return ratesService.createBulkCalculation({
        orgId,
        templateIds,
      });
    },
    onSuccess: (response) => {
      queryClient.setQueryData(['bulk-calculations', orgId], (old: unknown) => {
        if (!old) return { data: [response.data] };
        return {
          data: [...old.data, response.data],
        };
      });
      toast({
        title: 'Success',
        description: 'Calculation created successfully',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to create calculation',
        variant: 'destructive',
      });
    },
  });

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Bulk Rate Calculations</h2>
          <Button 
            onClick={() => createCalculation.mutate()}
            disabled={isLoading || createCalculation.isPending}
          >
            New Calculation
          </Button>
        </div>

        <div className="space-y-4">
          {calculationsData?.data.map((calc) => (
            <Card key={calc.id} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Calculation {calc.id}</h3>
                  <p className="text-sm text-gray-500">
                    Created: {new Date(calc.createdAt).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500">Status: {calc.status}</p>
                </div>
                {calc.status === 'completed' && <Button variant="outline">View Results</Button>}
              </div>
              {Array.isArray(calc.results) && calc.results.length > 0 ? (
                <div className="space-y-2">
                  <h4 className="font-semibold">Results</h4>
                  <ul className="space-y-1">
                    {calc.results.map((result) => (
                      <li
                        key={`${calc.id}-${result.templateId}`}
                        className="flex items-center justify-between"
                      >
                        <span>Template {result.templateId}</span>
                        <span className="font-medium">${result.rate.toFixed(2)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="p-4 text-center text-gray-500">
                  <p>No rates calculated</p>
                </div>
              )}
            </Card>
          ))}
        </div>
      </Card>
    </div>
  );
}
