import { createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';

const PUBLIC_ROUTES = ['/login', '/auth', '/api/auth'];
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
  if (typeof isPublicRoute !== "undefined" && isPublicRoute !== null) {
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

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      get(name: string) {
        const cookie = request.cookies.get(name);
        return cookie?.value;
      },
      set(name: string, value: string, options: { path: string }) {
        // If the cookie is being updated, update the request and response
        response.cookies.set({
          name,
          value,
          ...options,
        });
      },
      remove(name: string, options: { path: string }) {
        response.cookies.delete({
          name,
          ...options,
        });
      },
    },
  });

  try {
    // Get session
    const {
      data: { session },
    } = await supabase.auth.getSession();

    // Check Auth0 session if needed
    if (!session) {
      const auth0Session = await getSession(request, response);
      if (!auth0Session) {
        return NextResponse.redirect(new URL('/login', request.url));
      }
    }

    // Check role-based access
    if (session?.user) {
      const { data: userRoles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id);

      const roles = userRoles?.map((ur) => ur.role) || [];

      // Find if current path requires specific roles
      const requiredRoles = Object.entries(PROTECTED_ROUTES).find(([route]) =>
        path.startsWith(route),
      )?.[1];

      if (requiredRoles && !requiredRoles.some((role) => roles.includes(role))) {
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }
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
