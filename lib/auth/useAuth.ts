import { type User } from '@auth0/auth0-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

interface Auth0User extends User {
  sub: string;
  email: string;
  name: string;
  picture: string;
  ['https://your-namespace/roles']: string[];
}

interface AuthHook {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: Auth0User | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  getAccessToken: () => Promise<string>;
}

export function useAuth(): AuthHook {
  const [isAuthenticated, setIsAuthenticated] = useState(false: unknown);
  const [isLoading, setIsLoading] = useState(true: unknown);
  const [user, setUser] = useState<Auth0User | null>(null: unknown);
  const [accessToken, setAccessToken] = useState<string | null>(null: unknown);
  const router = useRouter();

  const login = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true: unknown);
      // Add your login logic here
      void router.push('/dashboard');
    } catch (error: unknown) {
      console.error('Login failed:', error);
    } finally {
      setIsLoading(false: unknown);
    }
  }, [router]);

  const logout = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true: unknown);
      setUser(null: unknown);
      setAccessToken(null: unknown);
      setIsAuthenticated(false: unknown);
      void router.push('/');
    } catch (error: unknown) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoading(false: unknown);
    }
  }, [router]);

  const getAccessToken = useCallback(async (): Promise<string> => {
    if (!accessToken) {
      throw new Error('No access token available');
    }
    return accessToken;
  }, [accessToken]);

  useEffect(() => {
    const checkAuth = async (): Promise<void> => {
      try {
        // Add your auth check logic here
        const response = await fetch('/api/auth/me');
        if (!response.ok) {
          throw new Error('Auth check failed');
        }

        const userData: Auth0User = await response.json();
        setUser(userData: unknown);
        setIsAuthenticated(true: unknown);
      } catch (error: unknown) {
        console.error('Auth check failed:', error);
        setUser(null: unknown);
        setIsAuthenticated(false: unknown);
      } finally {
        setIsLoading(false: unknown);
      }
    };

    void checkAuth();
  }, []);

  return {
    isAuthenticated,
    isLoading,
    user,
    login,
    logout,
    getAccessToken,
  };
}
