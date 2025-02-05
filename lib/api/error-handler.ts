import { type NextRequest, NextResponse } from 'next/server';
import { createApiResponse } from './response';
import { logger } from '@/lib/logger';

type ErrorResponse = {
  message: string;
  status: number;
  details?: Record<string, unknown>;
};

export function withErrorHandler<T>(
  handler: (req: NextRequest, context: unknown) => Promise<NextResponse<T>>
): (req: NextRequest, context: unknown) => Promise<NextResponse<ErrorResponse>> {
  return async (req: NextRequest, context: unknown): Promise<NextResponse<ErrorResponse>> => {
    try {
      return await handler(req, context);
    } catch (error) {
      logger.error('API Error:', error);
      
      const errorResponse = errorHandler(error);

      return createApiResponse(
        undefined,
        errorResponse,
        errorResponse.status
      );
    }
  };
}

export const errorHandler = (error: unknown): ErrorResponse => {
  if (error instanceof Error) {
    return {
      message: error.message,
      status: 500,
      details: { stack: error.stack }
    };
  }
  
  return {
    message: 'An unknown error occurred',
    status: 500
  };
};
