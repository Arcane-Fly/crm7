import { useQuery } from '@tanstack/react-query';

import { ratesService } from '@/lib/services/rates';


export function useRates(orgId: string): void {
  return useQuery<RateData[], Error>({
    queryKey: ['rates', orgId],
    queryFn: async (): Promise<RateData[]> => {
      const { data } = await ratesService.getTemplates({ orgId });
      return data;
    },
  });
}
