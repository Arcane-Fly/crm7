import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import { auth0, supabase } from './auth.config';
import { User } from '@supabase/supabase-js';

interface AuthUser {
  id: string;
  email?: string;
  name?: string;
  image?: string;
  role?: string;
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Check Supabase session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          const { user: supabaseUser } = session;
          setUser(mapSupabaseUser(supabaseUser));
        } else {
          // Check Auth0
          const auth0User = await auth0.getUser();
          if (auth0User) {
            setUser(mapAuth0User(auth0User));
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // Sign in with email/password (Supabase)
  const signInWithEmail = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      if (data.user) {
        setUser(mapSupabaseUser(data.user));
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  // Sign in with Auth0
  const signInWithAuth0 = async () => {
    try {
      await auth0.loginWithRedirect();
    } catch (error) {
      console.error('Auth0 sign in error:', error);
      throw error;
    }
  };

  // Sign up with email/password (Supabase)
  const signUpWithEmail = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;
      if (data.user) {
        setUser(mapSupabaseUser(data.user));
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  };

  // Sign out
  const signOut = useCallback(async () => {
    try {
      // Sign out from Supabase
      await supabase.auth.signOut();
      
      // Sign out from Auth0
      await auth0.logout({
        logoutParams: {
          returnTo: window.location.origin
        }
      });

      setUser(null);
      router.push('/');
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  }, [router]);

  // Reset password
  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  };

  // Update password
  const updatePassword = async (newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      if (error) throw error;
    } catch (error) {
      console.error('Password update error:', error);
      throw error;
    }
  };

  // Helper functions to map users
  const mapSupabaseUser = (supabaseUser: User): AuthUser => ({
    id: supabaseUser.id,
    email: supabaseUser.email,
    name: supabaseUser.user_metadata?.full_name,
    image: supabaseUser.user_metadata?.avatar_url,
    role: supabaseUser.user_metadata?.role
  });

  const mapAuth0User = (auth0User: any): AuthUser => ({
    id: auth0User.sub,
    email: auth0User.email,
    name: auth0User.name,
    image: auth0User.picture,
    role: auth0User['https://your-namespace/roles']?.[0]
  });

  return {
    user,
    loading,
    signInWithEmail,
    signInWithAuth0,
    signUpWithEmail,
    signOut,
    resetPassword,
    updatePassword
  };
}
