import { handleAuth } from '@auth0/nextjs-auth0'

/**
 * Dynamic API route handler for Auth0 authentication.
 * This creates the following routes:
 * - /api/auth/login: Login with Auth0
 * - /api/auth/logout: Log out
 * - /api/auth/callback: Auth0 callback after login
 * - /api/auth/me: Get user profile
 */
export const GET = handleAuth({
  login: async (req, res) => {
    return await handleAuth({
      returnTo: '/dashboard'
    })(req, res)
  },
  callback: async (req, res) => {
    try {
      return await handleAuth()(req, res)
    } catch (error) {
      console.error(error)
      res.redirect('/api/auth/login')
    }
  },
  logout: async (req, res) => {
    return await handleAuth({
      returnTo: '/'
    })(req, res)
  }
})
