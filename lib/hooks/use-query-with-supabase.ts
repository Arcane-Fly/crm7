import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { logger } from '@/lib/services/logger'

interface QueryConfig<T> extends Omit<UseQueryOptions<T[], Error>, 'queryKey' | 'queryFn'> {
  queryKey: string[]
  table: string
  select?: string
  filter?: {
    column: string
    value: any
  }[]
  staleTime?: number
  cacheTime?: number
}

export function useSupabaseQuery<T>({
  queryKey,
  table,
  select = '*',
  filter,
  staleTime = 60 * 1000, // 1 minute
  cacheTime = 5 * 60 * 1000, // 5 minutes
  ...options
}: QueryConfig<T>) {
  const supabase = createClient()

  return useQuery({
    queryKey,
    queryFn: async () => {
      try {
        let query = supabase.from(table).select(select)

        if (filter) {
          filter.forEach(({ column, value }) => {
            query = query.eq(column, value)
          })
        }

        const { data, error } = await query

        if (error) throw error
        return data as T[]
      } catch (error) {
        logger.error(`Failed to fetch ${table}`, error as Error, { queryKey })
        throw error
      }
    },
    staleTime,
    cacheTime,
    ...options,
  })
}

interface MutationConfig<T> {
  table: string
  type: 'insert' | 'update' | 'delete'
  onSuccess?: (data: T) => void
  onError?: (error: Error) => void
  invalidateQueries?: string[][]
  optimisticUpdate?: (oldData: T[]) => T[]
}

export function useSupabaseMutation<T>({
  table,
  type,
  onSuccess,
  onError,
  invalidateQueries = [],
  optimisticUpdate,
}: MutationConfig<T>) {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async (_variables: any) => {
      try {
        let query = supabase.from(table)

        switch (type) {
          case 'insert':
            query = query.insert(_variables)
            break
          case 'update':
            query = query.update(_variables.data).eq('id', _variables.id)
            break
          case 'delete':
            query = query.delete().eq('id', _variables)
            break
        }

        const { data, error } = await query.select().single()

        if (error) throw error
        return data as T
      } catch (error) {
        logger.error(`Failed to ${type} ${table}`, error as Error, { variables })
        throw error
      }
    },
    onMutate: async (variables) => {
      if (optimisticUpdate) {
        // Cancel outgoing refetches
        await Promise.all(
          invalidateQueries.map((queryKey) =>
            queryClient.cancelQueries({ queryKey })
          )
        )

        // Save previous value
        const previousData = invalidateQueries.map((queryKey) =>
          queryClient.getQueryData<T[]>(queryKey)
        )

        // Optimistically update
        invalidateQueries.forEach((queryKey) => {
          const currentData = queryClient.getQueryData<T[]>(queryKey)
          if (currentData) {
            queryClient.setQueryData(queryKey, optimisticUpdate(currentData))
          }
        })

        return { previousData }
      }
    },
    onSuccess: (data) => {
      // Invalidate relevant queries
      invalidateQueries.forEach((queryKey) => {
        queryClient.invalidateQueries({ queryKey })
      })
      onSuccess?.(data)
    },
    onError: (error: Error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        invalidateQueries.forEach((queryKey, index) => {
          queryClient.setQueryData(queryKey, context.previousData[index])
        })
      }
      onError?.(error)
    },
  })
}

export function useInfiniteSupabaseQuery<T>({
  queryKey,
  table,
  select = '*',
  filter,
  pageSize = 10,
  ...options
}: QueryConfig<T> & { pageSize?: number }) {
  const supabase = createClient()

  return useQuery({
    queryKey,
    queryFn: async ({ pageParam = 0 }) => {
      try {
        let query = supabase
          .from(table)
          .select(select)
          .range(pageParam * pageSize, (pageParam + 1) * pageSize - 1)

        if (filter) {
          filter.forEach(({ column, value }) => {
            query = query.eq(column, value)
          })
        }

        const { data, error } = await query

        if (error) throw error
        return {
          data: data as T[],
          nextPage: data.length === pageSize ? pageParam + 1 : undefined,
        }
      } catch (error) {
        logger.error(`Failed to fetch ${table}`, error as Error, { queryKey, pageParam })
        throw error
      }
    },
    ...options,
  })
}
