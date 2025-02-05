import { type NextRequest, type NextResponse } from 'next/server';
import { captureError } from '@/lib/monitoring';
import { type Session } from '@auth0/nextjs-auth0';

interface Session {
  user: {
    roles: string[];
  };
}

type Handler<T> = (req: NextRequest, session: Session | null) => Promise<NextResponse<T>>;

export const withAuth = <T>(handler: Handler<T>): Handler<T> => {
  return async (req: NextRequest): Promise<NextResponse<T>> => {
    try {
      const session = await getSession(req);
      if (!session) {
        return new NextResponse('Unauthorized', { status: 401 });
      }
      return handler(req, session);
    } catch (error) {
      captureError(error instanceof Error ? error : new Error(String(error)), {
        context: 'auth0-middleware',
      });
      return new NextResponse('Internal Server Error', { status: 500 });
    }
  };
};

export function withRoles(handler: Handler<any>, allowedRoles: string[]): Handler<any> {
  return async (req: NextRequest): Promise<NextResponse<any>> => {
    try {
      const session = await getSession(req);
      const userRoles = session?.user?.roles || [];

      if (!allowedRoles.some((role) => userRoles.includes(role))) {
        return new NextResponse('Forbidden', { status: 403 });
      }

      return await withAuth(handler)(req);
    } catch (error) {
      captureError(error instanceof Error ? error : new Error(String(error)), {
        context: 'auth0-roles-middleware',
      });
      return new NextResponse('Unauthorized', { status: 401 });
    }
  };
}

async function getSession(req: NextRequest): Promise<Session | null> {
  // Implement session retrieval logic here
  return null;
}
