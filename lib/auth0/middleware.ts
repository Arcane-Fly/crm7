import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getSession } from '@auth0/nextjs-auth0'

/**
 * Auth0 middleware to protect routes.
 * This middleware will redirect unauthenticated users to the login page.
 */
export async function withAuth0(
  request: NextRequest,
  handler: (req: NextRequest, session: any) => Promise<NextResponse>
) {
  try {
    const session = await getSession()
    if (!session?.user) {
      return NextResponse.redirect(new URL('/api/auth/login', request.url))
    }

    const response = await handler(request, session)
    
    // Add session info to response headers instead of locals
    response.headers.set('x-user-id', session.user.sub)
    response.headers.set('x-user-email', session.user.email)
    
    return response
  } catch (error) {
    console.error('Auth0 Middleware Error:', error)
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
      const session = await getSession()
      if (!session?.user) {
        return NextResponse.redirect(new URL('/api/auth/login', req.url))
      }

      const userRoles = session.user['https://crm7.app/roles'] || []

      if (!allowedRoles.some(role => userRoles.includes(role))) {
        return new NextResponse('Unauthorized', { status: 403 })
      }

      return await withAuth0(req, async (req, session) => {
        return NextResponse.next()
      })
    } catch (error) {
      console.error('Auth middleware error:', error)
      return new NextResponse('Internal Server Error', { status: 500 })
    }
  }
}
