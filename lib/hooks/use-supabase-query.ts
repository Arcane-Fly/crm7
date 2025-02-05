import { useQuery, useMutation } from '@tanstack/react-query';
import { type SupabaseClient } from '@supabase/supabase-js';
import { type Database } from '@/types/supabase';

type TableName = keyof Database['public']['Tables'];

interface QueryOptions {
  filter?: Record<string, unknown>;
  select?: string;
}

export function useSupabaseQuery<T extends TableName>(
  supabase: SupabaseClient<Database>,
  table: T,
  options?: QueryOptions
): import("/home/braden/Desktop/Dev/crm7r/node_modules/.pnpm/@tanstack+react-query@5.66.0_react@18.2.0/node_modules/@tanstack/react-query/build/modern/types").UseQueryResult<any, Error> {
  return useQuery({
    queryKey: [table, options?.filter],
    queryFn: async (): Promise<any> => {
      try {
        const query = supabase.from(table).select(options?.select || '*');

        if (options?.filter) {
          Object.entries(options.filter).forEach(([column, value]) => {
            query.eq(column, value);
          });
        }

        const { data, error } = await query;

        if (typeof error !== "undefined" && error !== null) {
          throw error;
        }

        return data;
      } catch (error) {
        console.error('Supabase query error:', error);
        throw error;
      }
    },
  });
}

export function useSupabaseMutation<T extends TableName>(
  supabase: SupabaseClient<Database>,
  table: T
) {
  return useMutation({
    mutationFn: async ({
      data,
      match,
    }: {
      data: Record<string, unknown>;
      match?: Record<string, unknown>;
    }): Promise<any> => {
      try {
        const query = supabase.from(table);

        if (typeof match !== "undefined" && match !== null) {
          const { data: result, error } = await query.update(data).match(match);
          if (typeof error !== "undefined" && error !== null) throw error;
          return result;
        } else {
          const { data: result, error } = await query.insert(data);
          if (typeof error !== "undefined" && error !== null) throw error;
          return result;
        }
      } catch (error) {
        console.error('Supabase mutation error:', error);
        throw error;
      }
    },
  });
}
