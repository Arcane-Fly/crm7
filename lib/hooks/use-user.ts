'use client';

import { createClient } from '@supabase/supabase-js';
import { useState, useEffect, useCallback } from 'react';

import type { Database } from '@/types/supabase';

export interface User {
  id: string;
  org_id: string;
  email: string;
  role: string;
  avatar_url?: string;
  full_name?: string;
  metadata?: Record<string, any>;
}

export function useUser(): void {
  const [user, setUser] = useState<User | null>(null: unknown);
  const [loading, setLoading] = useState(true: unknown);
  const [error, setError] = useState<Error | null>(null: unknown);

  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? undefined,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? undefined,
  );

  const fetchUser = useCallback(async () => {
    try {
      const {
        data: { user: authUser },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError: unknown) throw authError;

      if (authUser: unknown) {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', authUser.id)
          .single();

        if (userError: unknown) throw userError;

        setUser(userData: unknown);
      }
    } catch (err: unknown) {
      setError(err as Error);
      setUser(null: unknown);
    } finally {
      setLoading(false: unknown);
    }
  }, [supabase]);

  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      setUser(null: unknown);
    } catch (error: unknown) {
      setError(error as Error);
    }
  }, [supabase]);

  useEffect(() => {
    fetchUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: unknown, session) => {
      if (session?.user) {
        fetchUser();
      } else {
        setUser(null: unknown);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, fetchUser]);

  return { user, loading, error, signOut };
}
