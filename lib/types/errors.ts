export class BaseError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly context?: string,
    public readonly details?: Record<string, unknown>
  ) {
    super(message)
    this.name = this.constructor.name
    Object.setPrototypeOf(this, new.target.prototype)
  }
}

export class SupabaseError extends BaseError {
  constructor(
    message: string,
    public readonly cause?: unknown,
    public readonly context?: string,
    public readonly details?: Record<string, unknown>
  ) {
    super(message, undefined, context, details)
    this.name = 'SupabaseError'
  }
}

export class AuthenticationError extends SupabaseError {
  constructor(message: string, cause?: unknown) {
    super(message, cause)
    this.name = 'AuthenticationError'
  }
}

export class DatabaseError extends SupabaseError {
  constructor(message: string, cause?: unknown) {
    super(message, cause)
    this.name = 'DatabaseError'
  }
}
