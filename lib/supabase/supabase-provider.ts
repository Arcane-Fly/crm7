import { createClient } from '@supabase/supabase-js';

import { SupabaseError } from '../types/errors';
import { type Database } from '../types/supabase';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new SupabaseError('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
}

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new SupabaseError('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable');
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase: ReturnType<typeof createClient<Database>> = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
    cookies: {
      async set(name: string, value: string, options: CookieOptions): Promise<void> {
        if (typeof document === 'undefined') return;
        let cookie = `${name}=${value}`;
        if (options.path) cookie += `; path=${options.path}`;
        if (options.maxAge) cookie += `; max-age=${options.maxAge}`;
        if (options.domain) cookie += `; domain=${options.domain}`;
        if (options.secure) cookie += '; secure';
        if (options.sameSite) cookie += `; samesite=${options.sameSite}`;
        document.cookie = cookie;
      },
    },
  },
);

export type SupabaseClient = typeof supabase;

export const useSupabase = (): void => {
  return { supabase };
};
