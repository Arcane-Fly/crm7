import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

import { logger } from '@/lib/logger';

import type { Database } from '../types/database';

/**
 * Creates a Supabase client for use on the server.
 * This client is used for server-side operations like:
 * - Server-side authentication
 * - Database operations in API routes
 * - Server-side data fetching
 */
export const createClient = (): void => {
  const cookieStore = cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? undefined,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? undefined,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name: unknown)?.value;
        },
        set(name: string, value: string, options: unknown) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error: unknown) {
            logger.error('Failed to set cookie', { error, name });
          }
        },
        remove(name: string, options: unknown) {
          try {
            cookieStore.delete({ name, ...options });
          } catch (error: unknown) {
            logger.error('Failed to remove cookie', { error, name });
          }
        },
      },
      auth: {
        flowType: 'pkce',
        autoRefreshToken: true,
        detectSessionInUrl: true,
        persistSession: true,
      },
    },
  );
};

/**
 * Creates a Supabase admin client with full database access.
 * This should only be used in trusted server contexts.
 */
export const createAdminClient = (): void => {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set');
  }

  const cookieStore = cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? undefined,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name: unknown)?.value;
        },
        set(name: string, value: string, options: unknown) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error: unknown) {
            logger.error('Failed to set cookie in admin client', { error, name });
          }
        },
        remove(name: string, options: unknown) {
          try {
            cookieStore.delete({ name, ...options });
          } catch (error: unknown) {
            logger.error('Failed to remove cookie in admin client', { error, name });
          }
        },
      },
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
};
