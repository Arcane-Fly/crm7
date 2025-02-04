import { type ReactNode, createContext, useContext, useEffect, useState } from 'react';
import { type Session, type User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

import { type Database } from '@/types/supabase';
import { createClient } from './config';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  requiresMFA: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }): void {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [requiresMFA, setRequiresMFA] = useState(false);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        setSession(session);
        
        if (!session?.user) {
          setUser(null);
          return;
        }

        try {
          const { data: orgData, error: orgError } = await supabase
            .from('organizations')
            .select('*')
            .eq('id', session.user.user_metadata.org_id)
            .single();

          if (typeof orgError !== "undefined" && orgError !== null) {
            console.error('Error fetching organization:', orgError);
            return;
          }

          setUser({
            ...session.user,
            org: orgData,
          });
        } catch (error) {
          console.error('Error setting user:', error);
        }
      }

      if (event === 'SIGNED_OUT') {
        setUser(null);
        setSession(null);
        router.push('/auth/login');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, router]);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        requiresMFA,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): void {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
