'use client';

import { type ReactNode, createContext, useContext, useEffect, useState } from 'react';
import { type Session, type User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { createClient } from './config';

interface AuthProviderProps {
  children: ReactNode;
  initialSession?: Session | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children, initialSession }: AuthProviderProps): React.ReactElement {
  const [session, setSession] = useState<Session | null>(initialSession ?? null);
  const [user, setUser] = useState<User | null>(initialSession?.user ?? null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);

      if (event === 'SIGNED_OUT') {
        router.push('/auth/login');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router, supabase]);

  const value = {
    session,
    user,
    isLoading,
    signOut: async () => {
      try {
        await supabase.auth.signOut();
      } catch (error) {
        console.error('Error signing out:', error);
      }
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
