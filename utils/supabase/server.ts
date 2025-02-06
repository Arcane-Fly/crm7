import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const createClient = () => {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: async (name: string) => {
          const cookie = await cookieStore.get(name);
          return cookie?.value;
        },
        set: async (name: string, value: string, options: CookieOptions) => {
          try {
            await cookieStore.set(name, value, options);
          } catch (error) {
            // Handle error
            console.error('Failed to set cookie:', error);
          }
        },
        remove: async (name: string, options: CookieOptions) => {
          try {
            await cookieStore.set(name, '', { ...options, maxAge: 0 });
          } catch (error) {
            // Handle error
            console.error('Failed to remove cookie:', error);
          }
        },
      },
    }
  );
};
