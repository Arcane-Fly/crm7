import { PrismaClient } from '@prisma/client';

import { logger } from '@/lib/utils/logger';

declare global {
   
  var prisma: PrismaClient | undefined;
}

class PrismaClientSingleton {
  private static instance: PrismaClient | undefined;

  public static getInstance(): void {
    if (!PrismaClientSingleton.instance) {
      PrismaClientSingleton.instance = new PrismaClient({
        log: [
          { level: 'query', emit: 'event' },
          { level: 'error', emit: 'event' },
          { level: 'warn', emit: 'event' },
          { level: 'info', emit: 'event' },
        ],
      });

      // Log queries in development
      if (process.env.NODE_ENV === 'development') {
        PrismaClientSingleton.instance.$on('query', (e: unknown): void => {
          logger.debug('Prisma Query', {
            query: e.query,
            params: e.params,
            duration: `${e.duration}ms`,
          });
        });
      }

      // Log all errors
      PrismaClientSingleton.instance.$on('error', (e: unknown): void => {
        logger.error('Prisma Error', {
          target: e.target,
          message: e.message,
        });
      });

      // Log all warnings
      PrismaClientSingleton.instance.$on('warn', (e: unknown): void => {
        logger.warn('Prisma Warning', {
          target: e.target,
          message: e.message,
        });
      });
    }

    return PrismaClientSingleton.instance;
  }
}

// For development hot reloading
declare global {
   
  var prisma: PrismaClient | undefined;
}

const prisma = global.prisma || PrismaClientSingleton.getInstance();

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

export { prisma };
