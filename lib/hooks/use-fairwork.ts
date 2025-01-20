import { useQuery, useMutation } from '@tanstack/react-query'
import axios from 'axios'
import { z } from 'zod'

// Types
export const EmploymentType = z.enum(['casual', 'permanent', 'fixed-term'])
export type EmploymentType = z.infer<typeof EmploymentType>

export const SearchParams = z.object({
  query: z.string().optional(),
  industry: z.string().optional(),
  occupation: z.string().optional(),
  page: z.number().optional(),
  limit: z.number().optional(),
})
export type SearchParams = z.infer<typeof SearchParams>

export const CalculateParams = z.object({
  awardCode: z.string(),
  classificationCode: z.string(),
  date: z.string(),
  employmentType: EmploymentType,
  hours: z.number().optional(),
  penalties: z.array(z.string()).optional(),
  allowances: z.array(z.string()).optional(),
})
export type CalculateParams = z.infer<typeof CalculateParams>

export const ValidateParams = z.object({
  awardCode: z.string(),
  classificationCode: z.string(),
  rate: z.number(),
  date: z.string(),
  employmentType: EmploymentType,
})
export type ValidateParams = z.infer<typeof ValidateParams>

// API client
const fairworkApi = axios.create({
  baseURL: '/api/fairwork',
})

// Hooks
export function useSearchAwards(params?: SearchParams) {
  return useQuery({
    queryKey: ['awards', params],
    queryFn: async () => {
      const { data } = await fairworkApi.get('/awards', { params })
      return data
    },
    enabled: !!params,
  })
}

export function useAward(awardCode: string) {
  return useQuery({
    queryKey: ['award', awardCode],
    queryFn: async () => {
      const { data } = await fairworkApi.get(`/${awardCode}`)
      return data
    },
    enabled: !!awardCode,
  })
}

export function useClassification(awardCode: string, classificationCode: string) {
  return useQuery({
    queryKey: ['classification', awardCode, classificationCode],
    queryFn: async () => {
      const { data } = await fairworkApi.get(`/${awardCode}/${classificationCode}`)
      return data
    },
    enabled: !!awardCode && !!classificationCode,
  })
}

export function usePayRates(
  awardCode: string,
  classificationCode: string,
  date?: string,
  employmentType?: EmploymentType
) {
  return useQuery({
    queryKey: ['rates', awardCode, classificationCode, date, employmentType],
    queryFn: async () => {
      const { data } = await fairworkApi.get(`/${awardCode}/${classificationCode}/rates`, {
        params: { date, employmentType },
      })
      return data
    },
    enabled: !!awardCode && !!classificationCode,
  })
}

export function useRateHistory(
  awardCode: string,
  classificationCode: string,
  startDate: string,
  endDate: string
) {
  return useQuery({
    queryKey: ['history', awardCode, classificationCode, startDate, endDate],
    queryFn: async () => {
      const { data } = await fairworkApi.get(`/${awardCode}/${classificationCode}/history`, {
        params: { startDate, endDate },
      })
      return data
    },
    enabled: !!awardCode && !!classificationCode && !!startDate && !!endDate,
  })
}

export function useFutureRates(awardCode: string, classificationCode: string, fromDate: string) {
  return useQuery({
    queryKey: ['future', awardCode, classificationCode, fromDate],
    queryFn: async () => {
      const { data } = await fairworkApi.get(`/${awardCode}/${classificationCode}/future`, {
        params: { fromDate },
      })
      return data
    },
    enabled: !!awardCode && !!classificationCode && !!fromDate,
  })
}

export function usePenalties(awardCode: string, date?: string, type?: string) {
  return useQuery({
    queryKey: ['penalties', awardCode, date, type],
    queryFn: async () => {
      const { data } = await fairworkApi.get(`/${awardCode}/penalties`, {
        params: { date, type },
      })
      return data
    },
    enabled: !!awardCode,
  })
}

export function useAllowances(awardCode: string, date?: string, type?: string) {
  return useQuery({
    queryKey: ['allowances', awardCode, date, type],
    queryFn: async () => {
      const { data } = await fairworkApi.get(`/${awardCode}/allowances`, {
        params: { date, type },
      })
      return data
    },
    enabled: !!awardCode,
  })
}

export function useLeaveEntitlements(
  awardCode: string,
  employmentType: EmploymentType,
  date?: string
) {
  return useQuery({
    queryKey: ['leave', awardCode, employmentType, date],
    queryFn: async () => {
      const { data } = await fairworkApi.get(`/${awardCode}/leave-entitlements`, {
        params: { employmentType, date },
      })
      return data
    },
    enabled: !!awardCode && !!employmentType,
  })
}

export function useCalculatePay() {
  return useMutation({
    mutationFn: async (params: CalculateParams) => {
      const { data } = await fairworkApi.post('/calculate', params)
      return data
    },
  })
}

export function useValidateRate() {
  return useMutation({
    mutationFn: async (params: ValidateParams) => {
      const { data } = await fairworkApi.post(
        `/${params.awardCode}/${params.classificationCode}/validate`,
        params
      )
      return data
    },
  })
}
