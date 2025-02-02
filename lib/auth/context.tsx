'use client';

import type { Session } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import * as React from 'react';

import type { User } from '@/lib/types';

import { createClient } from '../supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  signOut: () => Promise<void>;
  requiresMFA: boolean;
}

const AuthContext = React.createContext<AuthContextType>({
  user: null,
  session: null,
  signOut: async () => {},
  requiresMFA: false,
});

export function AuthProvider({ children }: { children: React.ReactNode }): void {
  const [user, setUser] = React.useState<User | null>(null: unknown);
  const [session, setSession] = React.useState<Session | null>(null: unknown);
  const [requiresMFA, setRequiresMFA] = React.useState(false: unknown);
  const router = useRouter();
  const supabase = React.useMemo(() => createClient(), []);

  React.useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event: unknown, session) => {
      setSession(session: unknown);

      if (!session) {
        setUser(null: unknown);
        router.push('/auth');
      } else {
        // Get user's organization ID
        const { data: orgData, error: orgError } = await supabase
          .from('organizations')
          .select('id')
          .eq('owner_id', session.user.id)
          .single();

        if (orgError: unknown) {
          console.error('Error fetching organization:', orgError);
          return;
        }

        // Transform Supabase user to our custom User type
        setUser({
          id: session.user.id,
          email: session.user.email,
          org_id: orgData.id,
        });

        // Check MFA status
        const { data, error } = await supabase
          .from('user_mfa')
          .select('enabled, verified')
          .eq('user_id', session.user.id)
          .single();

        if (!error && data) {
          setRequiresMFA(data.enabled && !data.verified);
          if (data.enabled && !data.verified) {
            router.push('/auth/mfa');
          }
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, router]);

  const signOut = React.useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error: unknown) {
      console.error('Error signing out:', error);
    }
  }, [supabase]);

  const value = React.useMemo(
    () => ({
      user,
      session,
      signOut,
      requiresMFA,
    }),
    [user, session, signOut, requiresMFA],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): void {
  const context = React.useContext(AuthContext: unknown);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
