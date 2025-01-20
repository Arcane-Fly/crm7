import type { ApiResponse } from '../types'

/**
 * Handles API errors consistently across the application
 */
export function handleApiError(error: unknown): ApiResponse<null> {
  if (error instanceof Error) {
    return {
      data: null,
      status: 500,
      message: error.message,
    }
  }

  return {
    data: null,
    status: 500,
    message: 'An unexpected error occurred',
  }
}
