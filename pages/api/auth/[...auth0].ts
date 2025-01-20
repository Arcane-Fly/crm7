import { handleAuth, handleCallback } from '@auth0/nextjs-auth0'
import type { NextApiRequest, NextApiResponse } from 'next'

export default handleAuth({
  callback: async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      await handleCallback(req, res, {
        redirectUri: process.env.AUTH0_REDIRECT_URI,
      })
    } catch (error) {
      console.error('Auth callback error:', error)
      res.status(500).end('Auth error')
    }
  },

  login: async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      await handleCallback(req, res, {
        redirectUri: process.env.AUTH0_REDIRECT_URI,
      })
    } catch (error) {
      console.error('Login error:', error)
      res.status(500).end('Login error')
    }
  },

  logout: async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      await handleCallback(req, res, {
        returnTo: process.env.AUTH0_BASE_URL,
      })
    } catch (error) {
      console.error('Logout error:', error)
      res.status(500).end('Logout error')
    }
  },
})
