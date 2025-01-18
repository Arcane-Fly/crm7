import { handleAuth, handleCallback } from '@auth0/nextjs-auth0'
import { auth0Config } from '@/lib/auth/auth0.config'

export const GET = handleAuth({
  callback: handleCallback({
    afterCallback: async (req, session) => {
      // You can modify the session here if needed
      return session
    },
  }),
  login: async (req, res) => {
    await handleCallback(req, res, {
      returnTo: '/dashboard',
    })
  },
  logout: async (req, res) => {
    await handleCallback(req, res, {
      returnTo: '/',
    })
  },
})
