import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { getSession } from '@auth0/nextjs-auth0'
import { logger } from '@/lib/logger'

// Define protected routes and their required roles
const PROTECTED_ROUTES = {
  '/admin': ['admin'],
  '/api/admin': ['admin'],
  '/dashboard': ['user', 'admin'],
  '/api/dashboard': ['user', 'admin'],
} as const

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Initialize Supabase client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.delete({
            name,
            ...options,
          })
        },
      },
      auth: {
        flowType: 'pkce',
        detectSessionInUrl: true,
        persistSession: true,
      },
    }
  )

  try {
    // Check Supabase session
    const { data: { session: supabaseSession } } = await supabase.auth.getSession()
    const path = request.nextUrl.pathname

    // Public routes that don't require authentication
    const publicRoutes = [
      '/login',
      '/signup',
      '/forgot-password',
      '/api/auth/callback',
      '/api/auth/login',
      '/api/auth/logout',
      '/_next',
      '/static',
      '/images',
      '/favicon.ico'
    ]
    const isPublicRoute = publicRoutes.some(route => path.startsWith(route))

    // Skip auth check for public routes
    if (isPublicRoute) {
      return response
    }

    // Check Auth0 session for API routes
    if (path.startsWith('/api')) {
      try {
        const auth0Session = await getSession(request, response)
        if (!auth0Session) {
          return new NextResponse(
            JSON.stringify({ error: 'Unauthorized' }),
            { status: 401, headers: { 'Content-Type': 'application/json' } }
          )
        }

        // Check role-based access for protected routes
        const userRoles = auth0Session.user?.['https://crm7.app/roles'] || []
        const requiredRoles = Object.entries(PROTECTED_ROUTES).find(([route]) => 
          path.startsWith(route))?.[1]

        if (requiredRoles && !requiredRoles.some(role => userRoles.includes(role))) {
          return new NextResponse(
            JSON.stringify({ error: 'Forbidden' }),
            { status: 403, headers: { 'Content-Type': 'application/json' } }
          )
        }

        return response
      } catch (error) {
        logger.error('Auth0 session check failed', { error, path })
        return new NextResponse(
          JSON.stringify({ error: 'Authentication error' }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        )
      }
    }

    // For non-API routes, check Supabase session
    if (!supabaseSession) {
      const searchParams = new URLSearchParams({
        returnTo: request.nextUrl.pathname,
      })
      return NextResponse.redirect(new URL(`/login?${searchParams}`, request.url))
    }

    // Check role-based access for protected routes
    const userRoles = supabaseSession.user.app_metadata?.roles || []
    const requiredRoles = Object.entries(PROTECTED_ROUTES).find(([route]) => 
      path.startsWith(route))?.[1]

    if (requiredRoles && !requiredRoles.some(role => userRoles.includes(role))) {
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }

    return response
  } catch (error) {
    logger.error('Middleware error', { error, path: request.nextUrl.pathname })
    return new NextResponse(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.).*)',
  ],
}
