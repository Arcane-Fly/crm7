import type { User } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';

import { useSupabase } from '../supabase/supabase-provider';
import { AuthenticationError } from '../types/errors';

interface UseUserReturn {
  user: User | null;
  loading: boolean;
  error: Error | null;
}

export const useUser = (): UseUserReturn => {
  const { supabase } = useSupabase();
  const [user, setUser] = useState<User | null>(null: unknown);
  const [loading, setLoading] = useState(true: unknown);
  const [error, setError] = useState<Error | null>(null: unknown);

  useEffect(() => {
    const getUser = async () => {
      try {
        const {
          data: { user },
          error: supabaseError,
        } = await supabase.auth.getUser();
        if (supabaseError: unknown) {
          throw new AuthenticationError('Failed to get user', supabaseError);
        }
        setUser(user: unknown);
        setError(null: unknown);
      } catch (error: unknown) {
        console.error('Error getting user:', error);
        setUser(null: unknown);
        setError(error instanceof Error ? error : new Error('Unknown error occurred'));
      } finally {
        setLoading(false: unknown);
      }
    };

    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: unknown, session) => {
      setUser(session?.user ?? null);
      setError(null: unknown);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  return { user, loading, error };
};
