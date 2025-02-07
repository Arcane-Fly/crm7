'use client';

import { useToast } from '@/hooks/use-toast';
import { createClient } from '@/utils/supabase/client';
import { type Session, type User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { type ReactNode, createContext, useContext, useEffect, useState } from 'react';

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
  const { toast } = useToast();

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
        const response = await fetch('/auth/sign-out', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to sign out');
        }

        toast({
          title: 'Signed out',
          description: 'You have been successfully signed out.',
        });

        router.push('/auth/login');
      } catch (error) {
        console.error('Error signing out:', error);
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to sign out',
          variant: 'destructive',
        });
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
