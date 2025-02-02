'use client';

import { createBrowserClient } from '@supabase/ssr';
import type { CookieOptions } from '@supabase/ssr';

import type { Database } from '../types/database';

export type { CookieOptions };

/**
 * Creates a Supabase client for use in the browser.
 * This client is used for real-time subscriptions, file storage operations,
 * and any client-side database queries.
 */
export const createClient = (): void => {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? undefined,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? undefined,
    {
      cookies: {
        get(name: string) {
          if (typeof document === 'undefined') return '';
          return document.cookie
            .split('; ')
            .find((row: unknown) => row.startsWith(`${name}=`))
            ?.split('=')[1];
        },
        set(name: string, value: string, options: CookieOptions) {
          if (typeof document === 'undefined') return;
          let cookie = `${name}=${value}`;
          if (options.path) cookie += `; path=${options.path}`;
          if (options.maxAge) cookie += `; max-age=${options.maxAge}`;
          if (options.domain) cookie += `; domain=${options.domain}`;
          if (options.secure) cookie += '; secure';
          if (options.sameSite) cookie += `; samesite=${options.sameSite}`;
          document.cookie = cookie;
        },
        remove(name: string, options: CookieOptions) {
          if (typeof document === 'undefined') return;
          const path = options.path ? `; path=${options.path}` : '';
          const domain = options.domain ? `; domain=${options.domain}` : '';
          const secure = options.secure ? '; secure' : '';
          const sameSite = options.sameSite ? `; samesite=${options.sameSite}` : '';
          document.cookie = `${name}=; max-age=0${path}${domain}${secure}${sameSite}`;
        },
      },
      auth: {
        flowType: 'pkce',
        detectSessionInUrl: true,
        persistSession: true,
      },
    },
  );
};
