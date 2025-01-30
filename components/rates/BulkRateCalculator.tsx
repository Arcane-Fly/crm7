import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { type ReactElement } from 'react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { ratesService } from '@/lib/services/rates';
import type { BulkCalculation, RateTemplate } from '@/lib/types/rates';

interface BulkRateCalculatorProps {
  orgId?: string;
}

type GetTemplatesResponse = { data: RateTemplate[] };
type GetBulkCalculationsResponse = { data: BulkCalculation[] };
type CreateBulkCalculationResponse = { data: BulkCalculation };

export function BulkRateCalculator({
  orgId = 'default-org',
}: BulkRateCalculatorProps): ReactElement {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch templates and calculations
  const { data: templatesData } = useQuery<GetTemplatesResponse>({
    queryKey: ['templates', orgId],
    queryFn: () => ratesService.getTemplates({ org_id: orgId }),
  });

  const { data: calculationsData, isLoading } = useQuery<GetBulkCalculationsResponse>({
    queryKey: ['bulk-calculations', orgId],
    queryFn: async () => {
      const response = await ratesService.getBulkCalculations({ org_id: orgId });
      return response as unknown as GetBulkCalculationsResponse;
    },
  });

  // Create calculation mutation
  const createCalculation = useMutation<CreateBulkCalculationResponse, Error, void>({
    mutationFn: async () => {
      if (!templatesData?.data) {
        throw new Error('No templates available');
      }
      const templateIds = templatesData.data.slice(0, 2).map((t) => t.id);
      const response = await ratesService.createBulkCalculation({
        org_id: orgId,
        templateIds,
      });
      return response as unknown as CreateBulkCalculationResponse;
    },
    onSuccess: (response) => {
      queryClient.setQueryData<GetBulkCalculationsResponse>(['bulk-calculations', orgId], (old) => {
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

  const handleCreateCalculation = () => {
    createCalculation.mutate();
  };

  return (
    <div className='space-y-4'>
      <Card className='p-4'>
        <div className='mb-4 flex items-center justify-between'>
          <h2 className='text-xl font-semibold'>Bulk Rate Calculations</h2>
          <Button
            onClick={handleCreateCalculation}
            disabled={isLoading || createCalculation.isPending}
          >
            New Calculation
          </Button>
        </div>

        <div className='space-y-4'>
          {calculationsData?.data.map((calc) => (
            <Card
              key={calc.id}
              className='p-4'
            >
              <div className='flex items-center justify-between'>
                <div>
                  <h3 className='font-medium'>Calculation {calc.id}</h3>
                  <p className='text-sm text-gray-500'>
                    Created: {new Date(calc.createdAt).toLocaleString()}
                  </p>
                  <p className='text-sm text-gray-500'>Status: {calc.status}</p>
                </div>
                {calc.status === 'completed' && <Button variant='outline'>View Results</Button>}
              </div>
              {calc.results && calc.results.length > 0 && (
                <div className='mt-4'>
                  <h4 className='mb-2 font-medium'>Results</h4>
                  <ul className='space-y-2'>
                    {calc.results.map((result) => (
                      <li
                        key={`${calc.id}-${result.templateId}`}
                        className='flex items-center justify-between'
                      >
                        <span>Template {result.templateId}</span>
                        <span className='font-medium'>${result.rate.toFixed(2)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </Card>
          ))}
        </div>
      </Card>
    </div>
  );
}
