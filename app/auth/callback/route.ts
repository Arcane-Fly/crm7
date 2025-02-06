import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase environment variables');
    }

    const response = NextResponse.redirect(new URL('/dashboard', request.url));

    const cookieStore = {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        response.cookies.set({
          name,
          value,
          ...options,
        });
      },
      remove(name: string, options: CookieOptions) {
        response.cookies.delete({
          name,
          ...options,
        });
      },
    };

    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: cookieStore,
    });

    // Exchange the code for a session
    await supabase.auth.exchangeCodeForSession(code);

    return response;
  }

  // If no code, redirect to auth page
  return NextResponse.redirect(new URL('/auth', request.url));
}
