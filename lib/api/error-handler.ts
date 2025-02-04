// Updated error handler with explicit generic type for the API response
import { type NextRequest, NextResponse } from 'next/server';
import { createApiResponse } from './response';
import { logger } from '@/lib/logger';

export function withErrorHandler<T>(
  handler: (req: NextRequest, context: unknown) => Promise<NextResponse<T>>
): Promise<void> {
  return async (req: NextRequest, context: unknown) => {
    try {
      return await handler(req, context);
    } catch (error) {
      logger.error('API Error:', error);
      
      if (error instanceof Error) {
        return createApiResponse(
          undefined,
          { 
            code: 'INTERNAL_SERVER_ERROR',
            message: error.message,
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
          },
          500
        );
      }

      return createApiResponse(
        undefined,
        { 
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred'
        },
        500
      );
    }
  };
}
