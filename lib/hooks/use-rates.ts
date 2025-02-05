import { useQuery } from '@tanstack/react-query';

import { ratesService } from '@/lib/services/rates';
import type { RateTemplate } from '@/lib/types/rates';

export function useRates(orgId: string): void {
  return useQuery<RateTemplate[], Error>({
    queryKey: ['rates', orgId],
    queryFn: async (): Promise<any> => {
      const { data } = await ratesService.getTemplates({ orgId });
      return data;
    },
  });
}
