import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { logger } from '@/lib/logger';
import { createErrorResponse } from './response';

export class ApiError extends Error {
  constructor(
    message: string,
    public code: string,
    public status: number = 400,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

type RouteHandler = (
  req: NextRequest,
  context: { params: Record<string, string> }
) => Promise<NextResponse>;

/**
 * Wrap a route handler with error handling
 */
export function withErrorHandler(handler: RouteHandler): RouteHandler {
  return async (req: NextRequest, context: { params: Record<string, string> }) => {
    try {
      return await handler(req, context);
    } catch (error) {
      // Handle known API errors
      if (error instanceof ApiError) {
        logger.warn('API Error', {
          code: error.code,
          message: error.message,
          details: error.details,
        });
        return createErrorResponse(error.code, error.message, error.details, error.status);
      }

      // Handle Zod validation errors
      if (error instanceof z.ZodError) {
        logger.warn('Validation Error', { issues: error.issues });
        return createErrorResponse(
          'VALIDATION_ERROR',
          'Invalid request data',
          error.issues,
          400
        );
      }

      // Log unknown errors
      logger.error('Unhandled Error', { error });

      // Return generic error in production
      if (process.env.NODE_ENV === 'production') {
        return createErrorResponse(
          'INTERNAL_SERVER_ERROR',
          'An unexpected error occurred',
          undefined,
          500
        );
      }

      // Return detailed error in development
      return createErrorResponse(
        'INTERNAL_SERVER_ERROR',
        error instanceof Error ? error.message : 'An unexpected error occurred',
        error,
        500
      );
    }
  };
}
