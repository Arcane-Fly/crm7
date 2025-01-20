import { handleAuth } from '@auth0/nextjs-auth0'
import { AUTH0_CONFIG } from '@/lib/auth0/client'

/**
 * Dynamic API route handler for Auth0 authentication.
 * This creates the following routes:
 * - /api/auth/login: Login with Auth0
 * - /api/auth/logout: Log out
 * - /api/auth/callback: Auth0 callback after login
 * - /api/auth/me: Get user profile
 */
export const GET = handleAuth(AUTH0_CONFIG)
