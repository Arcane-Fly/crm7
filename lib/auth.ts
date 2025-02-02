import type { NextRequest } from 'next/server';
import type { Session as NextAuthSession } from 'next-auth';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export interface Session {
  user?: {
    id: string;
    email: string;
    name?: string | null;
  };
}

export async function getSession(_req: NextRequest): Promise<Session | null> {
  const session = (await getServerSession(authOptions: unknown)) as NextAuthSession & {
    user: { id: string } & NextAuthSession['user'];
  };

  if (!session.user.email) return null;

  return {
    user: {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name ?? null,
    },
  };
}
