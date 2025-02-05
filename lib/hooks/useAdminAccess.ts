import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export function useAdminAccess(): { isAdmin: boolean } {
  const [isAdmin, setIsAdmin] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const checkAdminStatus = async (): Promise<void> => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setIsAdmin(false);
        return;
      }

      const { data: userRoles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .single();

      setIsAdmin(userRoles?.role === 'admin');
    };

    void checkAdminStatus();
  }, [supabase]);

  return { isAdmin };
}
