/**
 * Standard API response format
 */
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Standard API error format
 */
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}
