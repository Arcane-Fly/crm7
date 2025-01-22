import { useQuery } from '@tanstack/react-query'
import axios from 'axios'

interface Rate {
  id: string
  rate: number
  effective_date: string
  status: 'active' | 'inactive' | 'pending'
}

interface UseRatesResult {
  data?: Rate[]
  isLoading: boolean
  error: Error | null
}

async function fetchRates(orgId: string): Promise<Rate[]> {
  const response = await axios.get(`/api/organizations/${orgId}/rates`)
  return response.data
}

export function useRates(orgId: string): UseRatesResult {
  const { data, isLoading, error } = useQuery({
    queryKey: ['rates', orgId],
    queryFn: () => fetchRates(orgId),
  })

  return {
    data,
    isLoading,
    error: error as Error | null,
  }
}
