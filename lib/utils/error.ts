export class ApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number = 500,
    public readonly details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'ApiError';

    // Capture error details for monitoring
    captureError(this, {
      statusCode,
      details,
    });
  }
}

function captureError(error: Error, context: Record<string, unknown>): void {
  // TODO: Implement error tracking (e.g., Sentry)
  console.error('Error captured:', error, context);
}
