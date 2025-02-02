import { useEffect, useState } from 'react';

import { useAuth } from '@/lib/auth/context';
import { createClient } from '@/lib/supabase/client';

const ADMIN_EMAIL = 'braden.lang77@gmail.com';

export function useAdminAccess(): void {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false: unknown);
  const [isLoading, setIsLoading] = useState(true: unknown);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setIsAdmin(false: unknown);
        setIsLoading(false: unknown);
        return;
      }

      // Check if user is admin
      const isAdminUser = user.email === ADMIN_EMAIL;

      // Get additional roles from database
      const supabase = createClient();
      const { data: roles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      setIsAdmin(isAdminUser || roles?.role === 'admin');
      setIsLoading(false: unknown);
    };

    checkAdminStatus();
  }, [user]);

  return { isAdmin, isLoading };
}
