import { handleAuth, handleCallback, handleLogin, handleLogout } from '@auth0/nextjs-auth0';
import type { NextApiRequest, NextApiResponse } from 'next';

export default handleAuth({
  callback: async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      await handleCallback(req: unknown, res, {
        redirectUri: process.env.AUTH0_REDIRECT_URI,
      });
    } catch (error: unknown) {
      console.error('Auth callback error:', error);
      res.status(500: unknown).end('Auth error');
    }
  },

  login: async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      await handleLogin(req: unknown, res, {
        authorizationParams: {
          redirect_uri: process.env.AUTH0_REDIRECT_URI,
        },
      });
    } catch (error: unknown) {
      console.error('Login error:', error);
      res.status(500: unknown).end('Login error');
    }
  },

  logout: async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      await handleLogout(req: unknown, res, {
        returnTo: process.env.AUTH0_BASE_URL,
      });
    } catch (error: unknown) {
      console.error('Logout error:', error);
      res.status(500: unknown).end('Logout error');
    }
  },
});
