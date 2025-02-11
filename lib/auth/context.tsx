'use client';

import { useToast } from '@/hooks/use-toast';
import { createClient } from '@/utils/supabase/client';
import { type Session, type User } from '@supabase/supabase-js';
import { useRouter, usePathname } from 'next/navigation';
import { type ReactNode, createContext, useContext, useEffect, useState } from 'react';
import { logger } from '@/lib/logger';

interface AuthProviderProps {
  children: ReactNode;
  initialUser?: User | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children, initialUser }: AuthProviderProps): React.ReactElement {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(initialUser ?? null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();
  const { toast } = useToast();

  useEffect(() => {
    // Initial auth check using getUser()
    async function checkAuth() {
      try {
        const {
          data: { user: currentUser },
          error,
        } = await supabase.auth.getUser();
        if (error) {
          logger.error('Error checking auth state', { error });
          setUser(null);
          setSession(null);
        } else {
          setUser(currentUser);
          // Only get session after verifying user
          const {
            data: { session: currentSession },
          } = await supabase.auth.getSession();
          setSession(currentSession);
        }
      } catch (err) {
        logger.error('Unexpected error checking auth', { error: err });
        setUser(null);
        setSession(null);
      } finally {
        setIsLoading(false);
      }
    }

    checkAuth();

    // Subscribe to auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, _session) => {
      try {
        // Always verify user with getUser() on auth state changes
        const {
          data: { user: currentUser },
          error,
        } = await supabase.auth.getUser();

        if (error || !currentUser) {
          setUser(null);
          setSession(null);
          if (event !== 'SIGNED_OUT') {
            logger.error('Auth state change error', { error, event });
          }
        } else {
          setUser(currentUser);
          setSession(_session);
        }

        // Only redirect on sign out if not already on a public path
        if (event === 'SIGNED_OUT' && !pathname.startsWith('/auth/')) {
          router.push('/auth/login');
        }
      } catch (err) {
        logger.error('Error handling auth state change', { error: err, event });
        setUser(null);
        setSession(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router, supabase, pathname]);

  const value = {
    session,
    user,
    isLoading,
    signOut: async () => {
      try {
        await supabase.auth.signOut();
        router.push('/auth/login');
      } catch (error) {
        logger.error('Error signing out', { error });
        toast({
          title: 'Error signing out',
          description: 'Please try again later',
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
