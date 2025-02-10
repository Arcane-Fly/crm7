import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { logger } from '@/lib/logger';

export function createClient(request: NextRequest) {
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  return {
    supabase: createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          async get(name: string) {
            return request.cookies.get(name)?.value;
          },
          async set(name: string, value: string, options: CookieOptions) {
            response.cookies.set({
              name,
              value,
              ...options,
            });
          },
          async remove(name: string, options: CookieOptions) {
            response.cookies.set({
              name,
              value: '',
              ...options,
            });
          },
        },
      }
    ),
    response,
  };
}

export async function updateSession(request: NextRequest) {
  try {
    const { supabase, response } = createClient(request);

    // Always use getUser() to verify authentication
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      logger.error('Auth error in middleware', { error, path: request.nextUrl.pathname });
      return NextResponse.redirect(new URL('/login', request.url));
    }

    if (!user) {
      // If no authenticated user, redirect to login except for public paths
      const isPublicPath =
        request.nextUrl.pathname.startsWith('/login') ||
        request.nextUrl.pathname.startsWith('/auth') ||
        request.nextUrl.pathname === '/';

      if (!isPublicPath) {
        return NextResponse.redirect(new URL('/login', request.url));
      }
    }

    // Set secure cookie options
    const cookieOptions: CookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    };

    // Update session cookies if user is authenticated
    if (user) {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        response.cookies.set('sb-access-token', session.access_token, cookieOptions);
        response.cookies.set('sb-refresh-token', session.refresh_token, cookieOptions);
      }
    }

    return response;
  } catch (err) {
    logger.error('Unexpected error in middleware', { error: err });
    return NextResponse.redirect(new URL('/error', request.url));
  }
}
