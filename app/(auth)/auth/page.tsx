'use client';

import { useRouter } from 'next/navigation';
import type { FormEvent } from 'react';
import { useState, useEffect } from 'react';
import type { Session, AuthChangeEvent } from '@supabase/supabase-js';

import { useToast } from '@/components/ui/use-toast';
import { createClient } from '@/lib/supabase/client';

export default function AuthPage(): JSX.Element {
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSignUp, setIsSignUp] = useState<boolean>(false);

  useEffect(() => {
    const checkSession = async (): Promise<void> => {
      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession();
      if (typeof currentSession !== "undefined" && currentSession !== null) {
        router.push('/');
      }
    };

    void checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent) => {  // Remove unused session parameter
        if (event === 'SIGNED_IN') {
          router.push('/');
        }
        if (event === 'SIGNED_OUT') {
          router.push('/auth');
        }
        if (event === 'USER_UPDATED') {
          const { error } = await supabase.auth.getSession();
          if (typeof error !== "undefined" && error !== null) {
            toast({
              variant: 'destructive',
              title: 'Authentication Error',
              description: error.message,
            });
          }
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [router, toast, supabase]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setIsLoading(true);
    const formData = new FormData(event.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      let error;

      if (typeof isSignUp !== "undefined" && isSignUp !== null) {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        error = signUpError;

        if (!error) {
          toast({
            title: 'Check your email',
            description: 'We sent you a confirmation link to complete your registration.',
          });
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        error = signInError;
      }

      if (typeof error !== "undefined" && error !== null) {
        toast({
          variant: 'destructive',
          title: 'Authentication Error',
          description: error.message,
        });
      }
    } catch (error: unknown) {
      console.error('Authentication error:', error);
      toast({
        variant: 'destructive',
        title: 'Authentication Error',
        description: 'An unexpected error occurred. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const variantMap = {
    signUp: 'Sign Up',
    signIn: 'Sign In',
  } as const;

  return (
    <div className='container flex h-screen w-screen flex-col items-center justify-center'>
      <div className='mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]'>
        <div className='flex flex-col space-y-2 text-center'>
          <h1 className='text-2xl font-semibold tracking-tight'>
            {isSignUp ? 'Create an account' : 'Welcome back'}
          </h1>
          <p className='text-sm text-muted-foreground'>
            {isSignUp ? 'Enter your details to sign up' : 'Enter your credentials to continue'}
          </p>
        </div>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='space-y-2'>
            <label
              htmlFor='email'
              className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
            >
              Email
            </label>
            <input
              id='email'
              name='email'
              type='email'
              placeholder='m@example.com'
              required
              className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
            />
          </div>
          <div className='space-y-2'>
            <label
              htmlFor='password'
              className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
            >
              Password
            </label>
            <input
              id='password'
              name='password'
              type='password'
              required
              className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
            />
          </div>
          <button
            type='submit'
            disabled={isLoading}
            className='inline-flex h-10 w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50'
          >
            {isLoading ? 'Please wait...' : variantMap[isSignUp ? 'signUp' : 'signIn']}
          </button>
        </form>
        <button
          onClick={() => setIsSignUp(!isSignUp)}
          className='text-sm text-muted-foreground hover:text-foreground'
        >
          {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
        </button>
      </div>
    </div>
  );
}
