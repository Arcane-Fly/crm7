import {
  useQuery,
  useInfiniteQuery,
  UseQueryOptions,
  UseInfiniteQueryOptions,
} from '@tanstack/react-query'
import { useSupabase } from '@/lib/hooks/use-supabase'
import { logger } from '@/lib/services/logger'

interface QueryConfig<T>
  extends Omit<UseQueryOptions<T[], Error, T[], readonly unknown[]>, 'queryKey' | 'queryFn'> {
  queryKey: string[]
  table: string
  columns?: string
  filter?: { column: string; value: any }[]
  enabled?: boolean
}

interface InfiniteQueryConfig<T>
  extends Omit<UseInfiniteQueryOptions<T[], Error, T[], T[], string[]>, 'queryKey' | 'queryFn'> {
  queryKey: string[]
  table: string
  columns?: string
  filter?: { column: string; value: any }[]
  pageSize?: number
  enabled?: boolean
}

export function useQueryWithSupabase<T>({
  queryKey,
  table,
  columns = '*',
  filter,
  enabled = true,
  ...options
}: QueryConfig<T>) {
  const { supabase } = useSupabase()

  return useQuery<T[], Error>({
    queryKey,
    queryFn: async () => {
      try {
        let query = supabase.from(table).select(columns)

        if (filter) {
          filter.forEach(({ column, value }) => {
            query = query.eq(column, value)
          })
        }

        const { data, error } = await query

        if (error) {
          logger.error('Error in useQueryWithSupabase:', { error, table })
          throw error
        }

        return data as T[]
      } catch (error) {
        logger.error('Error in useQueryWithSupabase:', { error, table })
        throw error
      }
    },
    enabled,
    ...options,
  })
}

export function useInfiniteSupabaseQuery<T>({
  queryKey,
  table,
  columns = '*',
  filter,
  pageSize = 10,
  enabled = true,
  ...options
}: InfiniteQueryConfig<T>) {
  const { supabase } = useSupabase()

  return useInfiniteQuery<T[], Error>({
    queryKey,
    queryFn: async ({ pageParam = 0 }) => {
      try {
        let query = supabase
          .from(table)
          .select(columns)
          .range(pageParam * pageSize, (pageParam + 1) * pageSize - 1)

        if (filter) {
          filter.forEach(({ column, value }) => {
            query = query.eq(column, value)
          })
        }

        const { data, error } = await query

        if (error) {
          logger.error('Error in useInfiniteSupabaseQuery:', { error, table })
          throw error
        }

        return data as T[]
      } catch (error) {
        logger.error('Error in useInfiniteSupabaseQuery:', { error, table })
        throw error
      }
    },
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === pageSize ? allPages.length : undefined
    },
    enabled,
    ...options,
  })
}
