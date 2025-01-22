export class SupabaseError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown,
    public readonly context?: Record<string, unknown>
  ) {
    super(message)
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
