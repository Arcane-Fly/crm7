import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { ratesService } from '@/lib/services/rates';
import { type RateTemplate } from '@/lib/types/rates';

export function useRates(orgId: string): UseQueryResult<RateTemplate[], Error> {
  return useQuery<RateTemplate[], Error>({
    queryKey: ['rates', orgId],
    queryFn: async (): Promise<RateTemplate[]> => {
      const response = await ratesService.getTemplates({ orgId });
      return response.data;
    },
  });
}
