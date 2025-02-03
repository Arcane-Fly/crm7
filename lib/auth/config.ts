import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { type Database } from '@/types/supabase';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createSupabaseClient<Database>(supabaseUrl, supabaseAnonKey);

export function createClient() {
  return createSupabaseClient<Database>(supabaseUrl, supabaseAnonKey);
}

export function createBrowserSupabaseClient() {
  return createSupabaseClient<Database>(supabaseUrl, supabaseAnonKey);
}

export function createServerSupabaseClient() {
  return createSupabaseClient<Database>(supabaseUrl, supabaseAnonKey);
}
