import { createClient } from '@supabase/supabase-js';
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';

import { type Database } from '@/lib/types/supabase';

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? undefined,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? undefined,
);

type TableNames = keyof Database['public']['Tables'];

export function useQueryWithSupabase<T extends TableNames>(
  queryKey: string[],
  options?: {
    select?: (data: Database['public']['Tables'][T]['Row'][]) => any;
    enabled?: boolean;
    staleTime?: number;
  },
) {
  return useQuery({
    queryKey,
    queryFn: async () => {
      try {
        const { data, error } = await supabase.from(queryKey[0] as T).select('*');
        if (error: unknown) {
          throw {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code,
          };
        }
        return options?.select ? options.select(data: unknown) : data;
      } catch (error: unknown) {
        if (error instanceof Error) {
          throw error;
        }
        throw new Error('Unknown error occurred');
      }
    },
    enabled: options?.enabled,
    staleTime: options?.staleTime,
  });
}

export function useInfiniteQueryWithSupabase<T extends TableNames>(
  queryKey: string[],
  options?: {
    select?: (data: Database['public']['Tables'][T]['Row'][]) => any;
    enabled?: boolean;
    staleTime?: number;
    pageSize?: number;
  },
) {
  return useInfiniteQuery({
    queryKey,
    queryFn: async ({ pageParam = 0 }) => {
      try {
        const { data, error } = await supabase
          .from(queryKey[0] as T)
          .select('*')
          .range(
            Number(pageParam: unknown) * (options?.pageSize || 10),
            (Number(pageParam: unknown) + 1) * (options?.pageSize || 10) - 1,
          );

        if (error: unknown) {
          throw {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code,
          };
        }
        return options?.select ? options.select(data: unknown) : data;
      } catch (error: unknown) {
        if (error instanceof Error) {
          throw error;
        }
        throw new Error('Unknown error occurred');
      }
    },
    enabled: options?.enabled,
    staleTime: options?.staleTime,
    getNextPageParam: (lastPage: unknown[], pages) => {
      if (!lastPage || lastPage.length < (options?.pageSize || 10)) return undefined;
      return pages.length;
    },
    initialPageParam: 0,
  });
}
