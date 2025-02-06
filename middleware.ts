import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';

const PUBLIC_ROUTES = ['/auth', '/api/auth'];
const SECURITY_HEADERS = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'X-XSS-Protection': '1; mode=block',
};

const PROTECTED_ROUTES = {
  '/admin': ['admin'],
  '/api/admin': ['admin'],
};

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const path = request.nextUrl.pathname;
  const response = NextResponse.next();

  // Allow public routes
  const isPublicRoute = PUBLIC_ROUTES.some((route) => path.startsWith(route));
  if (isPublicRoute) {
    // Add security headers
    Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    return response;
  }

  // Add security headers to all responses
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // Handle Supabase auth
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables');
  }

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

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    // Redirect to login if not authenticated
    if (!session) {
      const redirectUrl = new URL('/auth', request.url);
      redirectUrl.searchParams.set('redirectedFrom', request.nextUrl.pathname);
      return NextResponse.redirect(redirectUrl);
    }

    // Check role-based access for protected routes
    const userRole = session.user.user_metadata.role || 'user';
    const requiredRoles = Object.entries(PROTECTED_ROUTES).find(([route]) =>
      path.startsWith(route)
    )?.[1];

    if (requiredRoles && !requiredRoles.includes(userRole)) {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }

    return response;
  } catch (error) {
    console.error('Middleware error:', error);
    return NextResponse.redirect(new URL('/error', request.url));
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};
