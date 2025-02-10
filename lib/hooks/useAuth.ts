import { useState, useEffect } from 'react';
import { type AuthUser } from '@/types/auth';
import { createClient } from '@/lib/supabase/client';

interface UseAuthReturn {
  user: AuthUser | null;
  loading: boolean;
  error: Error | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const supabase = createClient();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect((): void => {
    const checkAuth = async (): Promise<void> => {
      try {
        const {
          data: { user: auth0User },
          error: auth0Error,
        } = await supabase.auth.getUser();

        if (auth0Error) {
          throw auth0Error;
        }

        if (auth0User) {
          setUser({
            id: auth0User.id,
            email: auth0User.email ?? '',
            name: auth0User.user_metadata?.name ?? '',
            role: auth0User.user_metadata?.role ?? 'user',
          });
        } else {
          setUser(null);
        }
      } catch (error) {
        const errorObj = error instanceof Error ? error : new Error('Authentication error');
        setError(errorObj);
      } finally {
        setLoading(false);
      }
    };

    void checkAuth();
  }, [supabase]);

  const login = async (): Promise<void> => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'auth0',
        options: {
          redirectTo: window.location.origin,
        },
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error('Login failed');
      setError(errorObj);
      throw errorObj;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error('Logout failed');
      setError(errorObj);
      throw errorObj;
    }
  };

  return {
    user,
    loading,
    error,
    login,
    logout,
  };
}
