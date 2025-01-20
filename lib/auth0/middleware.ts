import { withMiddlewareAuthRequired } from '@auth0/nextjs-auth0/edge'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Auth0 middleware to protect routes.
 * This middleware will redirect unauthenticated users to the login page.
 */
export const withAuth = withMiddlewareAuthRequired({
  returnTo: (req) => req.url,
})

/**
 * Auth0 middleware to handle role-based access control.
 * @param allowedRoles - Array of roles that are allowed to access the route
 */
export function withRoles(allowedRoles: string[]) {
  return async function middleware(req: NextRequest) {
    try {
      const res = await withAuth(req)
      if (!(res instanceof NextResponse)) {
        return res
      }

      const user = res.locals?.user
      const userRoles = user?.['https://crm7.app/roles'] || []

      if (!allowedRoles.some(role => userRoles.includes(role))) {
        return new NextResponse('Unauthorized', { status: 403 })
      }

      return res
    } catch (error) {
      console.error('Auth middleware error:', error)
      return new NextResponse('Internal Server Error', { status: 500 })
    }
  }
}
