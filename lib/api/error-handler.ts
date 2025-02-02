import { type NextRequest, type NextResponse } from 'next/server';
import { z } from 'zod';

import { logger } from '@/lib/logger';
import { AppError, ValidationError, ErrorCode, type ErrorContext } from '@/lib/types/errors';

import { createErrorResponse } from './response';

type RouteHandler = (
  req: NextRequest,
  context: { params: Record<string, string> },
) => Promise<NextResponse>;

/**
 * Wraps a route handler with standardized error handling
 */
export function withErrorHandler(handler: RouteHandler): RouteHandler {
  return async (req: NextRequest, context: { params: Record<string, string> }) => {
    try {
      return await handler(req: unknown, context);
    } catch (error: unknown) {
      // Handle known application errors
      if (error instanceof AppError) {
        logger.warn('Application Error', {
          code: error.code,
          message: error.message,
          details: error.details,
          stack: error.stack,
          cause: error.cause,
        });
        return createErrorResponse(error.toJSON(), error.status);
      }

      // Handle Zod validation errors
      if (error instanceof z.ZodError) {
        const validationError = new ValidationError('Invalid request data', error);
        logger.warn('Validation Error', validationError.toJSON());
        return createErrorResponse(validationError.toJSON(), validationError.status);
      }

      // Handle unknown errors
      logger.error('Unhandled Error', {
        error,
        path: req.nextUrl.pathname,
        method: req.method,
      });

      // Convert unknown errors to AppError
      const appError = new AppError({
        code: ErrorCode.INTERNAL_ERROR,
        message: 'An unexpected error occurred',
        status: 500,
        cause: error instanceof Error ? error : undefined,
      });

      return createErrorResponse(appError.toJSON(), appError.status);
    }
  };
}
