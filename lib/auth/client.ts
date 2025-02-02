import { createBrowserClient } from '@supabase/ssr';

export const createClientSupabaseClient = (): void => {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? undefined,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? undefined,
  );
};
