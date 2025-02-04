'use client';

import { useRouter } from 'next/navigation';
import { useState, type ReactElement } from 'react';

import { supabase } from '@/lib/auth/config';
import { logger } from '@/lib/services/logger';

interface LoginError extends Error {
  message: string;
}

export default function LoginPage(): JSX.Element {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleAuth0Login = (): void => {
    window.location.href = `/api/auth/login?returnTo=${encodeURIComponent('/dashboard')}`;
  };

  const handleLogin = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (typeof error !== "undefined" && error !== null) throw error;
      if (data.session) {
        router.push('/dashboard');
      }
    } catch (err: unknown) {
      const loginError = err as LoginError;
      setError(loginError.message ?? 'An error occurred during login');
      logger.error('Login failed', loginError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='space-y-6'>
      <div className='text-center'>
        <h2 className='text-3xl font-bold'>Welcome back</h2>
        <p className='mt-2 text-sm text-gray-600'>Enter your credentials to continue</p>
      </div>

      <div className='space-y-4'>
        <button
          onClick={handleAuth0Login}
          className='w-full rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2'
        >
          Continue with Auth0
        </button>

        <div className='relative'>
          <div className='absolute inset-0 flex items-center'>
            <div className='w-full border-t border-gray-300' />
          </div>
          <div className='relative flex justify-center text-sm'>
            <span className='bg-white px-2 text-gray-500'>Or continue with email</span>
          </div>
        </div>

        <form onSubmit={handleLogin} className='space-y-4'>
          {error && <div className='rounded-md bg-red-50 p-4 text-sm text-red-700'>{error}</div>}

          <div>
            <label htmlFor='email' className='block text-sm font-medium text-gray-700'>
              Email
            </label>
            <input
              id='email'
              type='email'
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              required
              className='mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500'
            />
          </div>

          <div>
            <label htmlFor='password' className='block text-sm font-medium text-gray-700'>
              Password
            </label>
            <input
              id='password'
              type='password'
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              required
              className='mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500'
            />
          </div>

          <button
            type='submit'
            disabled={loading}
            className='w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50'
          >
            {loading ? 'Signing in...' : 'Sign in with Email'}
          </button>
        </form>
      </div>

      <p className='text-center text-sm text-gray-600'>
        Don&apos;t have an account?{' '}
        <button
          onClick={() => router.push('/signup')}
          className='font-medium text-blue-600 hover:text-blue-500'
        >
          Sign up
        </button>
      </p>
    </div>
  );
}
