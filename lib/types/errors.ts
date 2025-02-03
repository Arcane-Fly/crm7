export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly status: number;
  public readonly details?: Record<string, unknown>;
  public readonly cause?: Error;

  constructor(context: ErrorContext) {
    super(context.message);
    this.name = this.constructor.name;
    this.code = context.code;
    this.status = context.status;
    this.details = context.details;
    this.cause = context.cause;

    // Ensure proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, new.target.prototype);

    // Capture stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  public toJSON(): ErrorContext {
    return {
      code: this.code,
      message: this.message,
      status: this.status,
      details: this.details,
      stack: this.stack,
      cause: this.cause,
    };
  }
}
