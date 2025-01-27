import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { createLogger } from '@/lib/utils/logger';

const logger = createLogger('api-utils');

export type ApiResponse<T> = {
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
};

export type ApiHandler<T = unknown> = (
  req: NextRequest,
  params?: Record<string, string>,
) => Promise<NextResponse<ApiResponse<T>>>;

export type ApiConfig<T = unknown> = {
  schema?: z.Schema;
  handler: (data: T, params?: Record<string, string>) => Promise<unknown>;
  rateLimit?: {
    requests: number;
    window: number; // in seconds
  };
  cacheControl?: {
    maxAge: number;
    staleWhileRevalidate?: number;
  };
};

/**
 * Creates a standardized API handler with error handling, validation, and caching
 */
export function createApiHandler<T = unknown>(config: ApiConfig<T>): ApiHandler {
  return async (req: NextRequest, params?: Record<string, string>) => {
    try {
      // Rate limiting check
      if (config.rateLimit) {
        // TODO: Implement rate limiting
      }

      // Parse and validate request data
      let data: T;
      if (config.schema) {
        if (req.method === 'GET') {
          const url = new URL(req.url);
          data = config.schema.parse(Object.fromEntries(url.searchParams));
        } else {
          data = config.schema.parse(await req.json());
        }
      }

      // Execute handler
      const result = await config.handler(data, params);

      // Set cache headers if configured
      const headers = new Headers();
      if (config.cacheControl) {
        headers.set(
          'Cache-Control',
          `max-age=${config.cacheControl.maxAge}${
            config.cacheControl.staleWhileRevalidate
              ? `, stale-while-revalidate=${config.cacheControl.staleWhileRevalidate}`
              : ''
          }`,
        );
      }

      return NextResponse.json({ data: result }, { headers });
    } catch (error) {
      logger.error('API error:', { error, params });

      if (error instanceof z.ZodError) {
        return NextResponse.json(
          {
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Invalid request data',
              details: error.errors,
            },
          },
          { status: 400 },
        );
      }

      return NextResponse.json(
        {
          error: {
            code: 'INTERNAL_ERROR',
            message: 'An unexpected error occurred',
          },
        },
        { status: 500 },
      );
    }
  };
}
