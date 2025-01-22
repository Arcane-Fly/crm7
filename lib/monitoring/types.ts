import type { Span, Integration, Hub } from '@sentry/types'

export const SpanStatus = {
  Ok: 'ok',
  InternalError: 'internal_error',
  Cancelled: 'cancelled',
  InvalidArgument: 'invalid_argument',
  DeadlineExceeded: 'deadline_exceeded',
  NotFound: 'not_found',
  AlreadyExists: 'already_exists',
  PermissionDenied: 'permission_denied',
  ResourceExhausted: 'resource_exhausted',
  FailedPrecondition: 'failed_precondition',
  Aborted: 'aborted',
  OutOfRange: 'out_of_range',
  Unimplemented: 'unimplemented',
  Unavailable: 'unavailable',
  DataLoss: 'data_loss',
  Unauthenticated: 'unauthenticated',
} as const

export type SpanStatusType = (typeof SpanStatus)[keyof typeof SpanStatus]

// Extend Sentry's types with the methods we need
export interface SentrySpan extends Omit<Span, 'setStatus'> {
  setTag(key: string, value: string): this
  setStatus(status: (typeof SpanStatus)[keyof typeof SpanStatus]): this
  setData(key: string, value: unknown): this
  finish(endTimestamp?: number): void
  startChild(context: SpanContext): SentrySpan
}

export interface SentryTransaction extends SentrySpan {
  setName(name: string): this
  startChild(context: SpanContext): SentrySpan
}

export interface BrowserTracing {
  new (): Integration
}

export interface SentryScope extends Omit<Hub['getScope'], ''> {
  setTransactionName(name: string): this
  getTransaction(): SentryTransaction | undefined
  setTag(key: string, value: string): this
  setClient(client: any): this
  getClient(): any
  setLastEventId(eventId: string): this
  getLastEventId(): string | undefined
  setUser(user: Record<string, any> | null): this
  getUser(): Record<string, any> | undefined
  setTags(tags: Record<string, string>): this
  setExtras(extras: Record<string, any>): this
  setFingerprint(fingerprint: string[]): this
  clearBreadcrumbs(): this
}

export interface SentryHub extends Omit<Hub, 'getScope'> {
  configureScope(callback: (scope: SentryScope) => void): this
  getScope(): SentryScope | undefined
}

export interface ErrorWithContext extends Error {
  context?: Record<string, unknown>
  toJSON?(): Record<string, unknown>
}

// Re-export for use in other files
export type { Integration }

export interface SpanContext {
  name: string
  op: string
  description?: string
  data?: Record<string, unknown>
  tags?: Record<string, string>
}

export interface TransactionContext extends SpanContext {
  sampled?: boolean
  trimEnd?: boolean
}

export interface CustomIntegration extends Integration {
  name: string
  setupOnce: () => void
}

export interface PerformanceSpanOptions {
  op: string
  description?: string
  data?: Record<string, unknown>
  tags?: Record<string, string>
}

export interface MonitoringOptions {
  sampleRate?: number
  environment?: string
  release?: string
  debug?: boolean
}

export interface PerformanceMeasurement {
  name: string
  value: number
  unit?: string
  tags?: Record<string, unknown>
}

export interface WebVitals {
  name: string
  value: number
  rating?: 'good' | 'needs-improvement' | 'poor'
  delta?: number
  navigationType?: string
}

export interface ErrorContext {
  severity?: 'fatal' | 'error' | 'warning' | 'info' | 'debug'
  tags?: Record<string, string>
  extra?: Record<string, unknown>
}

export interface UserContext {
  id: string
  email?: string
  username?: string
  ip_address?: string
  [key: string]: unknown
}

export interface BreadcrumbContext {
  category?: string
  message: string
  level?: 'fatal' | 'error' | 'warning' | 'info' | 'debug'
  data?: Record<string, unknown>
}
