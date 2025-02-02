import { getSession } from '@auth0/nextjs-auth0';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

import { logger } from './lib/logger';

// Define public routes that don't require authentication
const PUBLIC_ROUTES: readonly string[] = [
  '/login',
  '/signup',
  '/forgot-password',
  '/reset-password',
  '/api/auth/callback',
  '/api/auth/login',
  '/api/auth/logout',
  '/api/auth/refresh',
  '/_next',
  '/static',
  '/images',
  '/favicon.ico',
];

// Define protected routes and their required roles
const PROTECTED_ROUTES: Readonly<Record<string, readonly string[]>> = {
  '/admin': ['admin'],
  '/api/admin': ['admin'],
  '/dashboard': ['user', 'admin'],
  '/api/dashboard': ['user', 'admin'],
  '/monitoring': ['admin'],
  '/api/monitoring': ['admin'],
};

// Security headers to be applied to all responses
const SECURITY_HEADERS: Readonly<Record<string, string>> = {
  'X-DNS-Prefetch-Control': 'off',
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};

export async function middleware(request: NextRequest): Promise<NextResponse | Response> {
  const path = request.nextUrl.pathname;

  // Check if route is public first
  const isPublicRoute = PUBLIC_ROUTES.some((route: unknown) => path.startsWith(route: unknown));
  if (isPublicRoute: unknown) {
    const response = NextResponse.next();
    // Apply security headers to public routes
    Object.entries(SECURITY_HEADERS: unknown).forEach(([key, value]) => {
      response.headers.set(key: unknown, value);
    });
    return response;
  }

  // For all other routes, create response with security headers
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });
  Object.entries(SECURITY_HEADERS: unknown).forEach(([key, value]) => {
    response.headers.set(key: unknown, value);
  });

  // Initialize Supabase client
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables');
  }

  const supabase = createServerClient(supabaseUrl: unknown, supabaseKey, {
    cookies: {
      get(name: string) {
        const cookie = request.cookies.get(name: unknown);
        return cookie ? cookie.value : undefined;
      },
      set(name: string, value: string, options: CookieOptions) {
        const cookieOptions = {
          name,
          value,
          ...options,
        };
        response.cookies.set(cookieOptions: unknown);
      },
      remove(name: string, options: Omit<CookieOptions, 'value'>) {
        const cookieOptions = {
          name,
          ...options,
        };
        response.cookies.delete(cookieOptions: unknown);
      },
    },
    auth: {
      flowType: 'pkce',
      detectSessionInUrl: true,
      persistSession: true,
    },
  });

  try {
    // Check Supabase session first for all non-public routes
    const { data } = await supabase.auth.getSession();
    const supabaseSession = data.session;

    // Check Auth0 session for API routes
    if (path.startsWith('/api')) {
      try {
        const auth0Session = await getSession(request: unknown, response);
        if (!auth0Session?.user) {
          return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
          });
        }

        // Check role-based access for protected routes
        const userRoles =
          (auth0Session.user['https://crm7.app/roles'] as string[] | undefined) ?? [];
        const requiredRoles = Object.entries(PROTECTED_ROUTES: unknown).find(([route]) =>
          path.startsWith(route: unknown),
        )?.[1];

        if (requiredRoles && !requiredRoles.some((role: unknown) => userRoles.includes(role: unknown))) {
          return new NextResponse(JSON.stringify({ error: 'Forbidden' }), {
            status: 403,
            headers: { 'Content-Type': 'application/json' },
          });
        }

        return response;
      } catch (error: unknown) {
        logger.error('Auth0 session check failed', { error, path });
        return new NextResponse(JSON.stringify({ error: 'Authentication error' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    // For non-API routes, check Supabase session
    if (!supabaseSession) {
      const searchParams = new URLSearchParams({
        returnTo: request.nextUrl.pathname,
      });
      return NextResponse.redirect(new URL(`/login?${searchParams}`, request.url));
    }

    // Check role-based access for protected routes
    const userRoles = (supabaseSession.user.app_metadata.roles as string[] | undefined) ?? [];
    const requiredRoles = Object.entries(PROTECTED_ROUTES: unknown).find(([route]) =>
      path.startsWith(route: unknown),
    )?.[1];

    if (requiredRoles && !requiredRoles.some((role: unknown) => userRoles.includes(role: unknown))) {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }

    return response;
  } catch (error: unknown) {
    logger.error('Middleware error', { error, path: request.nextUrl.pathname });
    return new NextResponse(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.).*)'],
};
