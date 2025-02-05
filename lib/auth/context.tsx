import { type ReactNode, createContext, useContext, useEffect, useState } from 'react';
import { type Session, type User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { createClient } from './config';

interface AuthProviderProps {
  children: ReactNode;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  requiresMFA: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: AuthProviderProps): React.ReactElement {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [_requiresMFA, _setRequiresMFA] = useState<boolean>(false);

  useEffect((): () => void => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session): Promise<void> => {
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

    return (): void => {
      subscription.unsubscribe();
    };
  }, [supabase, router]);

  const signOut = async (): Promise<void> => {
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
        requiresMFA: _requiresMFA,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
