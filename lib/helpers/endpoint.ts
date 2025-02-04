import { type NextRequest } from 'next/server';
import { logger } from '@/lib/logger';

export function monitorAPIEndpoint<T extends (...args: unknown[]) => Promise<any>>(
  originalMethod: T,
  endpointName: string
): T {
  return async function monitoredMethod(this: unknown, ...args: Parameters<T>): Promise<ReturnType<T>> {
    const startTime = Date.now();

    try {
      const result = await originalMethod.apply(this, args);
      const duration = Date.now() - startTime;

      logger.info(`API endpoint ${endpointName} completed`, {
        duration,
        success: true,
      });

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;

      logger.error(`API endpoint ${endpointName} failed`, {
        duration,
        error,
      });

      throw error;
    }
  } as T;
}
