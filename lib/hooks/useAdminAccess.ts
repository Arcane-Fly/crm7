import { useState, useEffect } from 'react';
import { useUser } from './use-user';

export function useAdminAccess() {
  const { user } = useUser();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsAdmin(false);
      setIsLoading(false);
      return;
    }

    const checkAdminAccess = async () => {
      try {
        // Check if user has admin role
        const hasAdminRole = user.roles?.includes('admin') ?? false;
        setIsAdmin(hasAdminRole);
      } catch (error) {
        console.error('Error checking admin access:', error);
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };

    void checkAdminAccess();
  }, [user]);

  return { isAdmin, isLoading };
}
