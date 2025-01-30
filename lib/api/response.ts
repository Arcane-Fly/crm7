import { NextResponse } from 'next/server';
import { z } from 'zod';

// API response schema
export const ApiResponse = z.object({
  data: z.unknown().optional(),
  error: z
    .object({
      code: z.string(),
      message: z.string(),
      details: z.unknown().optional(),
    })
    .optional(),
  meta: z.object({
    timestamp: z.date(),
    requestId: z.string().optional(),
  }),
});
export type ApiResponse = z.infer<typeof ApiResponse>;

/**
 * Create a standardized API response
 */
export function createApiResponse<T>(
  data?: T,
  error?: { code: string; message: string; details?: unknown },
  status = 200,
): NextResponse {
  const response = ApiResponse.parse({
    data,
    error,
    meta: {
      timestamp: new Date(),
      requestId: crypto.randomUUID(),
    },
  });

  return NextResponse.json(response, { status });
}

/**
 * Create an error response
 */
export function createErrorResponse(
  code: string,
  message: string,
  details?: unknown,
  status = 400,
): NextResponse {
  return createApiResponse(undefined, { code, message, details }, status);
}

/**
 * Create a success response
 */
export function createSuccessResponse<T>(data: T, status = 200): NextResponse {
  return createApiResponse(data, undefined, status);
}
