'use client';

import type { RealtimeChannel } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';

import { createClient } from '../supabase/client';

export function useRealtimeData<T>(
  table: string,
  initialData: T[] = [],
  filter?: { column: string; value: any },
) {
  const [data, setData] = useState<T[]>(initialData);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    let channel: RealtimeChannel | null = null;

    async function fetchData() {
      try {
        let query = supabase.from(table).select('*');
        if (filter) {
          query = query.eq(filter.column, filter.value);
        }
        const { data: initialData, error } = await query;
        if (error) throw error;
        setData(initialData || []);
      } catch (error) {
        setError(error as Error);
      } finally {
        setIsLoading(false);
      }
    }

    function setupRealtimeSubscription() {
      channel = supabase
        .channel(String(table))
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table,
          },
          (payload: any) => {
            if (payload.eventType === 'INSERT') {
              setData((current) => [...current, payload.new]);
            } else if (payload.eventType === 'DELETE') {
              setData((current) => current.filter((item: any) => item.id !== payload.old.id));
            } else if (payload.eventType === 'UPDATE') {
              setData((current) =>
                current.map((item: any) => (item.id === payload.new.id ? payload.new : item)),
              );
            }
          },
        )
        .subscribe();
    }

    fetchData();
    setupRealtimeSubscription();

    return () => {
      if (channel) {
        channel.unsubscribe();
      }
    };
  }, [table, filter]);

  return { data, error, isLoading };
}
