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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<Auth0User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const router = useRouter();

  const login = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      // Add your login logic here
      void router.push('/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const logout = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      setUser(null);
      setAccessToken(null);
      setIsAuthenticated(false);
      void router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoading(false);
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
        setUser(userData);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Auth check failed:', error);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
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
