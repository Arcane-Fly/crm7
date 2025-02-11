import { type NextAuthSession } from 'next-auth';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { createClient } from '@supabase/supabase-js';
import { type Database } from '@/types/supabase';

export async function getSession(): Promise<void> {
  const session = (await getServerSession(authOptions)) as NextAuthSession & {
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
    };
  };
  return session;
}

export async function withAuth(handler: Function): Promise<void> {
  return async (req: Request, context: unknown) => {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response('Unauthorized', { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return new Response('Unauthorized', { status: 401 });
    }

    try {
      const supabase = createClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL ?? undefined,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? undefined
      );

      const { data: { user }, error } = await supabase.auth.getUser(token);

      if (error || !user) {
        return new Response('Unauthorized', { status: 401 });
      }

      return handler(req, { ...context, user });
    } catch (error) {
      return new Response('Internal Server Error', { status: 500 });
    }
  };
}

export async function getUser(req: Request): Promise<void> {
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
