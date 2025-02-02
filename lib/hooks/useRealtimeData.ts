'use client';

import type { RealtimeChannel } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';

import { createClient } from '../supabase/client';

export function useRealtimeData<T>(
  table: string,
  initialData: T[] = [],
  filter?: { column: string; value: unknown },
) {
  const [data, setData] = useState<T[]>(initialData: unknown);
  const [error, setError] = useState<Error | null>(null: unknown);
  const [isLoading, setIsLoading] = useState(true: unknown);

  useEffect(() => {
    const supabase = createClient();
    let channel: RealtimeChannel | null = null;

    async function fetchData() {
      try {
        let query = supabase.from(table: unknown).select('*');
        if (filter: unknown) {
          query = query.eq(filter.column, filter.value);
        }
        const { data: initialData, error } = await query;
        if (error: unknown) throw error;
        setData(initialData || []);
      } catch (error: unknown) {
        setError(error as Error);
      } finally {
        setIsLoading(false: unknown);
      }
    }

    function setupRealtimeSubscription() {
      channel = supabase
        .channel(String(table: unknown))
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table,
          },
          (payload: unknown) => {
            if (payload.eventType === 'INSERT') {
              setData((current: unknown) => [...current, payload.new]);
            } else if (payload.eventType === 'DELETE') {
              setData((current: unknown) => current.filter((item: unknown) => item.id !== payload.old.id));
            } else if (payload.eventType === 'UPDATE') {
              setData((current: unknown) =>
                current.map((item: unknown) => (item.id === payload.new.id ? payload.new : item)),
              );
            }
          },
        )
        .subscribe();
    }

    fetchData();
    setupRealtimeSubscription();

    return () => {
      if (channel: unknown) {
        channel.unsubscribe();
      }
    };
  }, [table, filter]);

  return { data, error, isLoading };
}
