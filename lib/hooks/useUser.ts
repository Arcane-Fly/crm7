import { useState, useEffect } from 'react';
import { type User } from '@/types/auth';
import { createClient } from '@/lib/supabase/client';

interface UseUserReturn {
  user: User | null;
  loading: boolean;
  error: Error | null;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
}

export function useUser(): UseUserReturn {
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { user }, error: supabaseError } = await supabase.auth.getUser();

        if (supabaseError) {
          throw supabaseError;
        }

        setUser(user);
        setError(null);
      } catch (error) {
        const errorObj = error instanceof Error ? error : new Error('Failed to fetch user');
        setError(errorObj);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    void fetchUser();
  }, [supabase]);

  const refreshUser = async () => {
    try {
      setError(null);
      await supabase.auth.refreshSession();
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error('Failed to refresh user');
      setError(errorObj);
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error('Failed to logout');
      setError(errorObj);
    }
  };

  return {
    user,
    loading,
    error,
    refreshUser,
    logout,
  };
}
