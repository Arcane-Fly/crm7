import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { type SupabaseClient } from '@supabase/supabase-js';
import { type Database } from '@/types/supabase';

interface UseQueryWithSupabaseOptions<T> {
  select?: (data: T[]) => T[];
  staleTime?: number;
  pageSize?: number;
}

export function useQueryWithSupabase<T>(
  supabase: SupabaseClient<Database>,
  queryKey: string[],
  queryFn: () => Promise<{ data: T[]; error: Error | null }>,
  options?: UseQueryWithSupabaseOptions<T>
): import("/home/braden/Desktop/Dev/crm7r/node_modules/.pnpm/@tanstack+react-query@5.66.0_react@18.2.0/node_modules/@tanstack/react-query/build/modern/types").UseQueryResult<T[], Error> {
  return useQuery({
    queryKey,
    queryFn: async (): Promise<T[]> => {
      try {
        const { data, error } = await queryFn();

        if (typeof error !== "undefined" && error !== null) {
          throw error;
        }

        if (!data) {
          return [];
        }

        return options?.select ? options.select(data) : data;
      } catch (error) {
        console.error('Supabase query error:', error);
        throw error;
      }
    },
    staleTime: options?.staleTime,
  });
}

export function useInfiniteQueryWithSupabase<T>(
  supabase: SupabaseClient<Database>,
  queryKey: string[],
  queryFn: (from: number, to: number) => Promise<{ data: T[]; error: Error | null }>,
  options?: UseQueryWithSupabaseOptions<T>
) {
  return useInfiniteQuery({
    queryKey,
    queryFn: async ({ pageParam = 0 }): Promise<{ data: T[]; nextPage: any; }> => {
      try {
        const { data, error } = await queryFn(
          Number(pageParam) * (options?.pageSize || 10),
          (Number(pageParam) + 1) * (options?.pageSize || 10) - 1
        );

        if (typeof error !== "undefined" && error !== null) {
          throw error;
        }

        return {
          data: options?.select ? options.select(data || []) : data || [],
          nextPage: data?.length === options?.pageSize ? pageParam + 1 : undefined,
        };
      } catch (error) {
        console.error('Supabase infinite query error:', error);
        throw error;
      }
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    staleTime: options?.staleTime,
  });
}
