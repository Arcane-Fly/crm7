import { type NextRequest, type NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { type Database, type AuthSession } from '@/types/supabase';

export const withAuth = (handler: (req: NextRequest, session: AuthSession) => Promise<NextResponse>): (req: NextRequest) => Promise<NextResponse> => {
  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      const session = await getSession(req);
      if (!session) {
        return new Response('Unauthorized', { status: 401 });
      }
      return await handler(req, session);
    } catch (_error) {
      return new Response('Internal Server Error', { status: 500 });
    }
  };
};

export async function getUser(req: NextRequest): Promise<AuthSession | null> {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return null;
  }

  try {
    const supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL ?? undefined,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? undefined
    );

    const { data: { user } } = await supabase.auth.getUser(token);
    return user;
  } catch {
    return null;
  }
}
