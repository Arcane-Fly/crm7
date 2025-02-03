import { type NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { type Database } from '@/types/supabase';

export async function withAuth(handler: Function) {
  return async (req: NextRequest, context: any) => {
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
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
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

export async function getUser(req: NextRequest) {
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
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: { user } } = await supabase.auth.getUser(token);
    return user;
  } catch {
    return null;
  }
}
