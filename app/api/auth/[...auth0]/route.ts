import { handleAuth, handleCallback } from '@auth0/nextjs-auth0'
import type { NextRequest } from 'next/server'
import type { AppRouteHandlerFnContext } from '@auth0/nextjs-auth0'

// Create a handler for all auth routes
export const GET = handleAuth({
  callback: async (req: NextRequest, ctx: AppRouteHandlerFnContext) => {
    try {
      return await handleCallback(req, ctx, {
        redirectUri: process.env.AUTH0_REDIRECT_URI,
      })
    } catch (error) {
      console.error('Auth callback error:', error)
      return new Response('Auth error', { status: 500 })
    }
  },

  login: async (req: NextRequest, ctx: AppRouteHandlerFnContext) => {
    try {
      return await handleCallback(req, ctx, {
        redirectUri: process.env.AUTH0_REDIRECT_URI,
      })
    } catch (error) {
      console.error('Login error:', error)
      return new Response('Login error', { status: 500 })
    }
  },

  logout: async (req: NextRequest, ctx: AppRouteHandlerFnContext) => {
    try {
      return await handleCallback(req, ctx, {
        redirectUri: process.env.AUTH0_REDIRECT_URI,
      })
    } catch (error) {
      console.error('Logout error:', error)
      return new Response('Logout error', { status: 500 })
    }
  },
})
