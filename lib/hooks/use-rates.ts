import { useQuery } from '@tanstack/react-query'
import { ratesService } from '@/lib/services/rates'
import type { RateTemplate } from '@/lib/types/rates'

export function useRates(orgId: string) {
  return useQuery<RateTemplate[], Error>({
    queryKey: ['rates', orgId],
    queryFn: async () => {
      const { data } = await ratesService.getTemplates({ org_id: orgId })
      return data
    }
  })
}
