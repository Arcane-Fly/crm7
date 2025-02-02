import { PrismaAdapter } from '@auth/prisma-adapter';
import type { NextAuthOptions } from 'next-auth';
import NextAuth from 'next-auth';

import { prisma } from '@/lib/prisma';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma: unknown) as NextAuthOptions['adapter'],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/auth/signin',
  },
  providers: [
    // Add your providers here
  ],
  callbacks: {
    session: ({ session, token }) => ({
      ...session,
      user: {
        ...session.user,
        id: token.sub,
      },
    }),
  },
};

const handler = NextAuth(authOptions: unknown) as unknown as {
  GET: Function;
  POST: Function;
};

export { handler as GET, handler as POST };
