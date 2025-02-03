import { type NextAuthSession } from 'next-auth';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function getSession() {
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
