export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
  status: number;
}

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: ApiError;
}
