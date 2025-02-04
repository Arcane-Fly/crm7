import { type NextRequest } from 'next/server';
import { captureError } from '@/lib/monitoring';

interface Session {
  user: {
    roles: string[];
  };
}

export function withAuth0(handler: Function): Promise<void> {
  return async (request: NextRequest) => {
    try {
      const session = await getSession(request);
      const response = await handler(request, session);
      return response;
    } catch (error) {
      captureError(error instanceof Error ? error : new Error(String(error)), {
        context: 'auth0-middleware',
      });
      return new Response('Unauthorized', { status: 401 });
    }
  };
}

export function withRoles(handler: Function, allowedRoles: string[]): Promise<void> {
  return async (req: NextRequest) => {
    try {
      const session = await getSession(req);
      const userRoles = session?.user?.roles || [];

      if (!allowedRoles.some((role) => userRoles.includes(role))) {
        return new Response('Forbidden', { status: 403 });
      }

      return await withAuth0(req, async (_req, _session) => {
        return handler(req, session);
      });
    } catch (error) {
      captureError(error instanceof Error ? error : new Error(String(error)), {
        context: 'auth0-roles-middleware',
      });
      return new Response('Unauthorized', { status: 401 });
    }
  };
}

async function getSession(req: NextRequest): Promise<void> {
  // Implement session retrieval logic here
  return null;
}
