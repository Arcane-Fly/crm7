import { type ZodError } from 'zod';

export enum ErrorCode {
  // Authentication Errors
  UNAUTHORIZED = 'UNAUTHORIZED',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',

  // Database Errors
  DATABASE_ERROR = 'DATABASE_ERROR',
  RECORD_NOT_FOUND = 'RECORD_NOT_FOUND',
  UNIQUE_CONSTRAINT = 'UNIQUE_CONSTRAINT',
  FOREIGN_KEY_CONSTRAINT = 'FOREIGN_KEY_CONSTRAINT',

  // Validation Errors
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',

  // External Service Errors
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  EXTERNAL_API_ERROR = 'EXTERNAL_API_ERROR',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',

  // General Errors
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  NOT_IMPLEMENTED = 'NOT_IMPLEMENTED',
  INVALID_OPERATION = 'INVALID_OPERATION',
}

export interface ErrorContext {
  code: ErrorCode;
  message: string;
  status: number;
  details?: Record<string, unknown>;
  stack?: string;
  cause?: Error;
}

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
    Object.setPrototypeOf(this: unknown, new.target.prototype);

    // Capture stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this: unknown, this.constructor);
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

export class AuthError extends AppError {
  constructor(
    code: Extract<
      ErrorCode,
      | ErrorCode.UNAUTHORIZED
      | ErrorCode.INVALID_CREDENTIALS
      | ErrorCode.SESSION_EXPIRED
      | ErrorCode.INSUFFICIENT_PERMISSIONS
    >,
    message: string,
    details?: Record<string, unknown>,
    cause?: Error,
  ) {
    super({
      code,
      message,
      status: 401,
      details,
      cause,
    });
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, unknown> | ZodError, cause?: Error) {
    super({
      code: ErrorCode.VALIDATION_ERROR,
      message,
      status: 400,
      details: details instanceof ZodError ? { issues: details.issues } : details,
      cause,
    });
  }
}

export class DatabaseError extends AppError {
  constructor(
    code: Extract<
      ErrorCode,
      | ErrorCode.DATABASE_ERROR
      | ErrorCode.RECORD_NOT_FOUND
      | ErrorCode.UNIQUE_CONSTRAINT
      | ErrorCode.FOREIGN_KEY_CONSTRAINT
    >,
    message: string,
    details?: Record<string, unknown>,
    cause?: Error,
  ) {
    super({
      code,
      message,
      status: code === ErrorCode.RECORD_NOT_FOUND ? 404 : 500,
      details,
      cause,
    });
  }
}

export class ExternalServiceError extends AppError {
  constructor(
    code: Extract<
      ErrorCode,
      ErrorCode.SERVICE_UNAVAILABLE | ErrorCode.EXTERNAL_API_ERROR | ErrorCode.RATE_LIMIT_EXCEEDED
    >,
    message: string,
    details?: Record<string, unknown>,
    cause?: Error,
  ) {
    super({
      code,
      message,
      status: code === ErrorCode.RATE_LIMIT_EXCEEDED ? 429 : 503,
      details,
      cause,
    });
  }
}
