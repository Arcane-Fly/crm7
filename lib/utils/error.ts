import { captureError } from '@/lib/monitoring'

/**
 * Handles API errors consistently across the application
 */
export interface ApiErrorResponse {
  error: {
    message: string
    code?: string
    details?: unknown
  }
}

export interface ApiSuccessResponse<T> {
  data: T
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse

interface ApiErrorOptions {
  message: string
  statusCode?: number
  code?: string
  cause?: Error
  context?: Record<string, unknown>
}

export class ApiError extends Error {
  readonly statusCode: number
  readonly code: string
  readonly context?: Record<string, unknown>

  constructor({
    message,
    statusCode = 500,
    code = 'INTERNAL_SERVER_ERROR',
    cause,
    context,
  }: ApiErrorOptions) {
    super(message)
    this.name = 'ApiError'
    this.statusCode = statusCode
    this.code = code
    this.context = context
    this.cause = cause

    // Capture error in monitoring with context
    captureError(this, {
      severity: 'error',
      context: `api-error:${this.code}`,
      statusCode: this.statusCode,
      code: this.code,
      ...this.context,
    })
  }

  toResponse(): ApiErrorResponse {
    return {
      error: {
        message: this.message,
        code: this.code,
        details: this.cause,
      },
    }
  }
}

export function handleApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error
  }

  const message = error instanceof Error ? error.message : 'An unexpected error occurred'

  return new ApiError({
    message,
    cause: error instanceof Error ? error : undefined,
  })
}

export function createApiError(
  message: string,
  options: Omit<ApiErrorOptions, 'message'> = {}
): ApiError {
  return new ApiError({ message, ...options })
}
