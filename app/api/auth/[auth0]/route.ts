import { handleAuth, HandlerError } from '@auth0/nextjs-auth0'
import type { NextApiRequest, NextApiResponse } from 'next'
import { NextResponse } from 'next/server'
import { captureError, ErrorSeverity, monitorAPIEndpoint } from '@/lib/monitoring'

/**
 * Dynamic API route handler for Auth0 authentication.
 * This creates the following routes:
 * - /api/auth/login: Login with Auth0
 * - /api/auth/logout: Log out
 * - /api/auth/callback: Auth0 callback after login
 * - /api/auth/me: Get user profile
 */
const handler = handleAuth({
  login: async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      await handleAuth()(req, res)
      return NextResponse.redirect(new URL('/dashboard', req.url))
    } catch (error) {
      captureError(error as Error, ErrorSeverity.ERROR, {
        route: '/api/auth/login',
        error: error instanceof HandlerError ? error.message : 'Unknown error',
      })

      if (error instanceof HandlerError) {
        return new NextResponse(error.message, { status: error.status })
      }
      return new NextResponse('Internal Server Error', { status: 500 })
    }
  },
  callback: async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      return await handleAuth()(req, res)
    } catch (error) {
      captureError(error as Error, ErrorSeverity.ERROR, {
        route: '/api/auth/callback',
        error: error instanceof HandlerError ? error.message : 'Unknown error',
      })

      if (error instanceof HandlerError) {
        return new NextResponse(error.message, { status: error.status })
      }
      return NextResponse.redirect(new URL('/api/auth/login', req.url))
    }
  },
  logout: async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      await handleAuth()(req, res)
      return NextResponse.redirect(new URL('/', req.url))
    } catch (error) {
      captureError(error as Error, ErrorSeverity.ERROR, {
        route: '/api/auth/logout',
        error: error instanceof HandlerError ? error.message : 'Unknown error',
      })

      if (error instanceof HandlerError) {
        return new NextResponse(error.message, { status: error.status })
      }
      return new NextResponse('Internal Server Error', { status: 500 })
    }
  },
})

// Add monitoring middleware and handle request/response
export const GET = async (req: NextApiRequest, res: NextApiResponse) => {
  const monitoredHandler = monitorAPIEndpoint('/api/auth/[auth0]')
  return monitoredHandler(req, res, () => handler(req, res))
}
