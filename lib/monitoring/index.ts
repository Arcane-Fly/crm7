import * as Sentry from '@sentry/nextjs'
import type { EventHint } from '@sentry/types'
import type {
  SentrySpan as Span,
  SentryTransaction as Transaction,
  SentryHub,
  SentryScope,
  SpanContext,
} from './types'
import { SpanStatus } from './types'
import { env } from '../config/environment'
import { logger } from '@/lib/services/logger'

export type ErrorSeverity = 'fatal' | 'error' | 'warning' | 'info' | 'debug'

interface MonitoringOptions {
  sampleRate?: number
  environment?: string
  release?: string
  debug?: boolean
}

/**
 * Initialize monitoring services with configuration
 */
export function initializeMonitoring(_options: MonitoringOptions = {}) {
  if (env.SENTRY_DSN) {
    initSentry()
  }

  // Initialize other monitoring services if configured
  if (env.DATADOG_API_KEY) {
    // Initialize Datadog
    // TODO: Add Datadog initialization
  }
}

function initSentry() {
  Sentry.init({
    dsn: env.SENTRY_DSN,
    tracesSampleRate: env.NODE_ENV === 'production' ? 0.1 : 1.0,
    environment: env.NODE_ENV,
    debug: env.NODE_ENV === 'development',
    integrations: [
      // These integrations are now handled by @sentry/nextjs automatically
      // when using their Next.js SDK
    ],
  })
}

// Capture and report errors with context
interface ErrorOptions {
  severity?: ErrorSeverity
  context?: string
  url?: string
  [key: string]: unknown
}

export function captureError(error: Error, options: ErrorOptions = {}) {
  const { severity = 'error', ...context } = options

  const eventHint: EventHint = {
    originalException: error,
    data: context,
  }

  Sentry.captureException(error, eventHint)
  const errorInfo = {
    message: error.message,
    stack: error.stack,
    name: error.name,
    severity,
    ...context,
  }
  logger.error('Error captured', errorInfo)
}

// Set user context for error tracking
export function setUserContext(user: {
  id: string
  email?: string
  role?: string
  organization?: string
}) {
  Sentry.setUser({
    id: user.id,
    email: user.email,
    role: user.role,
    organization: user.organization,
  })
}

// Start a new transaction for performance monitoring
export function startTransaction(
  name: string,
  op: string,
  context?: Record<string, unknown>
): Transaction | undefined {
  try {
    const hub = Sentry.getCurrentHub() as unknown as SentryHub
    const transaction = (Sentry as any).startTransaction({
      name,
      op,
      ...context,
    }) as Transaction

    hub.configureScope((scope: SentryScope) => {
      scope.setTransactionName(name)
    })

    return transaction
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error))
    const errorInfo = {
      message: err.message,
      stack: err.stack,
      name: err.name,
      transactionName: name,
      operation: op,
    }
    logger.error('Failed to start transaction', errorInfo)
    return undefined
  }
}

// Start a new span within a transaction
export function startSpan(name: string, options: Record<string, unknown> = {}): Span | undefined {
  try {
    const hub = Sentry.getCurrentHub() as unknown as SentryHub
    const scope = hub.getScope()
    const transaction = scope?.getTransaction()

    if (!transaction) {
      logger.warn('No active transaction found when starting span:', { name })
      return undefined
    }

    const spanContext: SpanContext = {
      name,
      op: (options.op as string) || name,
      description: options.description as string,
      data: options.data as Record<string, unknown>,
      tags: options.tags as Record<string, string>,
    }

    return transaction.startChild(spanContext)
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error))
    const errorInfo = {
      message: err.message,
      stack: err.stack,
      name: err.name,
      spanName: name,
    }
    logger.error('Failed to start span', errorInfo)
    return undefined
  }
}

// Helper function to finish a span with status and data
function finishSpan(
  span: Span | undefined,
  status: (typeof SpanStatus)[keyof typeof SpanStatus],
  data?: Record<string, unknown>
) {
  if (span) {
    if (data) {
      Object.entries(data).forEach(([key, value]) => {
        span.setTag(key, String(value))
      })
    }
    span.setStatus(status)
    span.finish()
  }
}

// Monitor an async operation with automatic span creation and error handling
export async function withMonitoring<T>(
  name: string,
  operation: () => Promise<T>,
  options: Record<string, unknown> = {}
): Promise<T> {
  const span = startSpan(name, options)

  try {
    const result = await operation()
    finishSpan(span, SpanStatus.Ok)
    return result
  } catch (error) {
    finishSpan(span, SpanStatus.InternalError, {
      errorMessage: error instanceof Error ? error.message : String(error),
    })
    throw error
  }
}

// Monitor database queries with automatic span creation
export async function monitorDatabaseQuery<T>(name: string, query: () => Promise<T>): Promise<T> {
  const span = startSpan(name, { op: 'db.query' })

  try {
    const result = await query()
    finishSpan(span, SpanStatus.Ok)
    return result
  } catch (error) {
    finishSpan(span, SpanStatus.InternalError, {
      errorMessage: error instanceof Error ? error.message : String(error),
    })
    throw error
  }
}

// Monitor API endpoints performance and errors
export function monitorAPIEndpoint(endpoint: string) {
  return function (_target: any, _propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value

    descriptor.value = async function (...args: any[]) {
      const transaction = startTransaction(endpoint, 'http.server')

      try {
        const result = await originalMethod.apply(this, args)
        finishSpan(transaction, SpanStatus.Ok)
        return result
      } catch (error) {
        finishSpan(transaction, SpanStatus.InternalError, {
          errorMessage: error instanceof Error ? error.message : String(error),
        })
        throw error
      }
    }

    return descriptor
  }
}
