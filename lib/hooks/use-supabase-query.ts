import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSupabase } from '@/lib/hooks/use-supabase'
import type { UseQueryResult, UseMutationResult } from '@tanstack/react-query'
import { PostgrestError } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

interface QueryFilter {
  column: string
  value: string | number | boolean | null
}

type Tables = Database['public']['Tables']
type TableName = keyof Tables
type TableRow<T extends TableName> = Tables[T]['Row']
type TableInsert<T extends TableName> = Tables[T]['Insert']

interface QueryConfig<T extends TableName> {
  queryKey: readonly unknown[]
  table: T
  filter?: QueryFilter[]
  enabled?: boolean
}

interface MutationConfig<T extends TableName> {
  table: T
  onError?: (error: PostgrestError) => void
  onSuccess?: (data: TableRow<T>) => void
  invalidateQueries?: readonly unknown[][]
}

interface MutationData<T extends TableName> {
  match?: Record<string, string | number | boolean | null>
  data: Partial<TableInsert<T>>
}

export type QueryResult<T extends TableName> = UseQueryResult<TableRow<T>[], PostgrestError>
export type MutationResult<T extends TableName> = UseMutationResult<
  TableRow<T>,
  PostgrestError,
  MutationData<T>
>

export function useSupabaseQuery<T extends TableName>({
  queryKey,
  table,
  filter,
  enabled = true,
}: QueryConfig<T>): QueryResult<T> {
  const { supabase } = useSupabase()

  return useQuery({
    queryKey,
    queryFn: async () => {
      try {
        const query = supabase.from(table).select('*')

        if (filter) {
          filter.forEach(({ column, value }) => {
            if (value !== undefined && value !== null) {
              query.eq(column, value)
            }
          })
        }

        const { data, error } = await query

        if (error) {
          console.error(`Error fetching from ${table}:`, error)
          throw error
        }

        return (data ?? []) as TableRow<T>[]
      } catch (error) {
        console.error(`Unexpected error in ${table} query:`, error)
        if (error instanceof PostgrestError) {
          throw error
        }
        throw new PostgrestError({
          message: 'Unknown error occurred',
          code: 'UNKNOWN_ERROR',
          details: '',
          hint: '',
        })
      }
    },
    enabled,
  })
}

export function useSupabaseMutation<T extends TableName>({
  table,
  onError,
  onSuccess,
  invalidateQueries = [],
}: MutationConfig<T>): MutationResult<T> {
  const { supabase } = useSupabase()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ match, data }: MutationData<T>) => {
      try {
        const query = supabase.from(table)

        if (match) {
          const { data: result, error } = await query.update(data).match(match)
          if (error) throw error
          if (!result?.[0])
            throw new PostgrestError({
              message: 'No rows returned',
              code: 'NO_ROWS_RETURNED',
              details: '',
              hint: '',
            })
          return result[0] as TableRow<T>
        } else {
          const { data: result, error } = await query.insert(data)
          if (error) throw error
          if (!result?.[0])
            throw new PostgrestError({
              message: 'No rows returned',
              code: 'NO_ROWS_RETURNED',
              details: '',
              hint: '',
            })
          return result[0] as TableRow<T>
        }
      } catch (error) {
        console.error(`Error in ${table} mutation:`, error)
        if (error instanceof PostgrestError) {
          throw error
        }
        throw new PostgrestError({
          message: 'Unknown error occurred',
          code: 'UNKNOWN_ERROR',
          details: '',
          hint: '',
        })
      }
    },
    onError: (error: PostgrestError) => {
      console.error(`Error in ${table} mutation:`, error)
      onError?.(error)
    },
    onSuccess: (data: TableRow<T>) => {
      onSuccess?.(data)
      invalidateQueries.forEach((queryKey) => {
        queryClient.invalidateQueries({ queryKey })
      })
    },
  })
}
