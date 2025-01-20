import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getSession, Session, Claims } from '@auth0/nextjs-auth0'
import { captureError } from '@/lib/monitoring'

// Extended session type with our custom claims
interface ExtendedClaims extends Claims {
  'https://crm7.app/roles'?: string[]
}

interface ExtendedSession extends Omit<Session, 'user'> {
  user: {
    sub: string
    email?: string
    email_verified?: boolean
  } & ExtendedClaims
}

/**
 * Auth0 middleware to protect routes.
 * This middleware will redirect unauthenticated users to the login page.
 */
export async function withAuth0(
  request: NextRequest,
  handler: (req: NextRequest, session: ExtendedSession) => Promise<NextResponse>
) {
  try {
    const session = (await getSession()) as ExtendedSession | null
    if (!session?.user) {
      return NextResponse.redirect(new URL('/api/auth/login', request.url))
    }

    const response = await handler(request, session)

    // Add session info to response headers instead of locals
    if (session.user.sub) {
      response.headers.set('x-user-id', session.user.sub)
    }
    if (session.user.email) {
      response.headers.set('x-user-email', session.user.email)
    }

    return response
  } catch (error) {
    captureError(error instanceof Error ? error : new Error(String(error)), {
      context: 'auth0/middleware',
      url: request.url,
    })
    return NextResponse.redirect(new URL('/api/auth/login', request.url))
  }
}

/**
 * Auth0 middleware to handle role-based access control.
 * @param allowedRoles - Array of roles that are allowed to access the route
 */
export function withRoles(allowedRoles: string[]) {
  return async function middleware(req: NextRequest) {
    try {
      const session = (await getSession()) as ExtendedSession | null
      if (!session?.user) {
        return NextResponse.redirect(new URL('/api/auth/login', req.url))
      }

      const userRoles = session.user['https://crm7.app/roles'] || []

      if (!allowedRoles.some((role) => userRoles.includes(role))) {
        captureError(new Error('Unauthorized access attempt'), {
          context: 'auth0/middleware',
          url: req.url,
          severity: 'warning',
        })
        return new NextResponse('Unauthorized', { status: 403 })
      }

      return await withAuth0(req, async (_req, _session) => {
        return NextResponse.next()
      })
    } catch (error) {
      captureError(error instanceof Error ? error : new Error(String(error)), {
        context: 'auth0/middleware',
        url: req.url,
      })
      return new NextResponse('Internal Server Error', { status: 500 })
    }
  }
}
