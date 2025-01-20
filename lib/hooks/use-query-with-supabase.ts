import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import type { PostgrestError } from '@supabase/supabase-js'
import type { UseQueryOptions, UseInfiniteQueryOptions } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import { logger } from '@/lib/services/logger'

type QueryOptions<T> = Omit<UseQueryOptions<T[], PostgrestError>, 'queryKey' | 'queryFn'>
type InfiniteQueryOptions<T> = Omit<
  UseInfiniteQueryOptions<T[], PostgrestError>,
  'queryKey' | 'queryFn'
>

export function useQueryWithSupabase<T>(
  table: string,
  queryKey: string[],
  options: QueryOptions<T> = {}
) {
  return useQuery<T[], PostgrestError>({
    queryKey: ['supabase', table, ...queryKey],
    queryFn: async () => {
      try {
        const { data, error } = await supabase.from(table).select('*')

        if (error) {
          logger.error('Error in useQueryWithSupabase:', {
            message: error.message,
            details: error.details,
            table,
          })
          throw error
        }

        return data
      } catch (error) {
        logger.error('Error in useQueryWithSupabase:', {
          message: (error as Error).message,
          table,
        })
        throw error
      }
    },
    ...options,
  })
}

export function useInfiniteSupabaseQuery<T>(
  table: string,
  queryKey: string[],
  { pageSize = 10, ...options }: InfiniteQueryOptions<T> & { pageSize?: number } = {}
) {
  return useInfiniteQuery<T[], PostgrestError>({
    queryKey: ['supabase', table, 'infinite', ...queryKey],
    queryFn: async ({ pageParam = 0 }) => {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .range(Number(pageParam) * pageSize, (Number(pageParam) + 1) * pageSize - 1)

        if (error) {
          logger.error('Error in useInfiniteSupabaseQuery:', {
            message: error.message,
            details: error.details,
            table,
          })
          throw error
        }

        return data
      } catch (error) {
        logger.error('Error in useInfiniteSupabaseQuery:', {
          message: (error as Error).message,
          table,
        })
        throw error
      }
    },
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage || lastPage.length < pageSize) return undefined
      return allPages.length
    },
    ...options,
  })
}
