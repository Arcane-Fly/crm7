import { handleAuth, handleCallback } from '@auth0/nextjs-auth0'
import { auth0Config } from '@/lib/auth/auth0.config'

const { baseURL, routes } = auth0Config

export const GET = handleAuth({
  callback: handleCallback({
    afterCallback: async (req, session) => {
      return session
    },
  }),
  login: async (req, res) => {
    await handleCallback(req, res, {
      returnTo: '/dashboard',
      baseURL,
    })
  },
  logout: async (req, res) => {
    await handleCallback(req, res, {
      returnTo: '/',
      baseURL,
    })
  },
})
