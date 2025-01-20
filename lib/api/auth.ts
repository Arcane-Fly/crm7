import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';
import { createErrorResponse } from './response';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type RouteHandler = (
  req: NextRequest,
  context: { params: Record<string, string> }
) => Promise<NextResponse>;

/**
 * Wrap a route handler with authentication
 */
export function withAuth(handler: RouteHandler): RouteHandler {
  return async (req: NextRequest, context: { params: Record<string, string> }) => {
    try {
      // Get auth header
      const authHeader = req.headers.get('authorization');
      if (!authHeader?.startsWith('Bearer ')) {
        return createErrorResponse(
          'UNAUTHORIZED',
          'Missing or invalid authorization header',
          undefined,
          401
        );
      }

      // Get token
      const token = authHeader.split(' ')[1];
      if (!token) {
        return createErrorResponse(
          'UNAUTHORIZED',
          'Missing access token',
          undefined,
          401
        );
      }

      // Verify token
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (error || !user) {
        logger.warn('Authentication failed', { error });
        return createErrorResponse(
          'UNAUTHORIZED',
          'Invalid access token',
          undefined,
          401
        );
      }

      // Add user to request
      const requestWithUser = new Request(req.url, {
        method: req.method,
        headers: req.headers,
        body: req.body,
        signal: req.signal,
      });
      (requestWithUser as any).user = user;

      return handler(requestWithUser as NextRequest, context);
    } catch (error) {
      logger.error('Auth error', { error });
      return createErrorResponse(
        'AUTH_ERROR',
        'Authentication error',
        undefined,
        500
      );
    }
  };
}

/**
 * Get the authenticated user from the request
 */
export function getUser(req: NextRequest) {
  return (req as any).user;
}
