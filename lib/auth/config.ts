import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { type Database } from '@/types/supabase';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? undefined;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? undefined;

export const supabase = createSupabaseClient<Database>(supabaseUrl, supabaseAnonKey);

export function createClient(): void {
  return createSupabaseClient<Database>(supabaseUrl, supabaseAnonKey);
}

export function createBrowserSupabaseClient(): void {
  return createSupabaseClient<Database>(supabaseUrl, supabaseAnonKey);
}

export function createServerSupabaseClient(): void {
  return createSupabaseClient<Database>(supabaseUrl, supabaseAnonKey);
}
