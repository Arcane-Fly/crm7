'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import type { AuthChangeEvent } from '@supabase/supabase-js';
import { useToast } from '@/components/ui/use-toast';
import { createClient } from '@/lib/supabase/client';

export default function AuthPage(): JSX.Element {
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();

  useEffect(() => {
    const checkSession = async (): Promise<void> => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      if (currentSession) {
        router.push('/');
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent) => {
      if (event === 'SIGNED_IN') {
        router.push('/');
      }
      if (event === 'SIGNED_OUT') {
        router.push('/auth');
      }
      if (event === 'USER_UPDATED') {
        const { error } = await supabase.auth.getSession();
        if (error) {
          toast({
            variant: 'destructive',
            title: 'Authentication Error',
            description: error.message,
          });
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [router, toast, supabase]);

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      {/* Form implementation */}
    </div>
  );
}
