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
  },
);

export type SupabaseClient = typeof supabase;

export const useSupabase = (): void => {
  return { supabase };
};
