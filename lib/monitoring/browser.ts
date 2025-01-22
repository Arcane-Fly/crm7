import * as Sentry from '@sentry/nextjs'
import type { SentryTransaction as _Transaction, BrowserTracing } from './types'
import { SpanStatus } from './types'
import { logger } from '@/lib/logger'

type ErrorWithMetadata = {
  name: string
  message: string
  stack?: string
}

function toErrorMetadata(maybeError: unknown): ErrorWithMetadata {
  if (maybeError instanceof Error) {
    return {
      name: maybeError.name,
      message: maybeError.message,
      stack: maybeError.stack,
    }
  }

  const message = typeof maybeError === 'string' ? maybeError : JSON.stringify(maybeError)

  return {
    name: 'UnknownError',
    message,
    stack: new Error(message).stack,
  }
}

function startBrowserSpan(
  name: string,
  operation: string,
  tags?: Record<string, unknown>
): _Transaction | undefined {
  try {
    const span = (Sentry as any).startTransaction({
      name,
      op: operation,
    }) as _Transaction

    if (span && tags) {
      Object.entries(tags).forEach(([key, value]) => {
        span.setTag(key, String(value))
      })
    }

    return span
  } catch (err) {
    logger.error('Error starting browser span', {
      error: toErrorMetadata(err),
    })
    return undefined
  }
}

function finishBrowserSpan(
  span: _Transaction | undefined,
  status: (typeof SpanStatus)[keyof typeof SpanStatus],
  data?: Record<string, unknown>
): void {
  if (!span) return

  try {
    if (data) {
      Object.entries(data).forEach(([key, value]) => {
        span.setData(key, value)
      })
    }

    span.setStatus(status)
    span.finish()
  } catch (err) {
    logger.error('Error finishing browser span', {
      error: toErrorMetadata(err),
    })
  }
}

/**
 * Initialize browser monitoring
 */
function _initializeBrowserMonitoring(): void {
  try {
    const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN
    if (!dsn) {
      logger.warn('Sentry DSN not configured', {
        status: 'disabled',
        component: 'BrowserMonitoring',
      })
      return
    }

    Sentry.init({
      dsn,
      environment: process.env.NEXT_PUBLIC_ENVIRONMENT,
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
      integrations: [new (Sentry as any).BrowserTracing() as BrowserTracing],
    })

    logger.info('Browser monitoring initialized', {
      status: 'initialized',
      dsn,
      component: 'BrowserMonitoring',
    })
  } catch (err) {
    logger.error('Failed to initialize browser monitoring', {
      error: toErrorMetadata(err),
    })
  }
}

/**
 * Report web vitals metrics to monitoring
 */
export function reportWebVitals(): void {
  try {
    // onFID((metric) => _reportVital('FID', metric))
    // onTTFB((metric) => _reportVital('TTFB', metric))
    // onLCP((metric) => _reportVital('LCP', metric))
    // onCLS((metric) => _reportVital('CLS', metric))
    // onFCP((metric) => _reportVital('FCP', metric))
  } catch (error) {
    logger.warn('Error setting up web vitals', {
      error: toErrorMetadata(error),
      status: 'failed',
      component: 'BrowserMonitoring',
    })
  }
}

function _reportVital(name: string, metric: any): void {
  const span = startBrowserSpan(name, 'web.vitals')

  try {
    if (!span) return

    span.setData('value', metric.value)
    span.setData('rating', metric.rating)
    span.setData('delta', metric.delta)
    span.setData('navigationType', metric.navigationType)

    span.setStatus(SpanStatus.Ok)
    span.finish()
  } catch (err) {
    logger.error('Error reporting vital', {
      error: toErrorMetadata(err),
    })
  }
}

/**
 * Monitor page load performance
 */
export function startPageLoadMonitoring(): void {
  const span = startBrowserSpan('page.load', 'navigation')

  try {
    if (!span) return

    // Add performance timing data
    const timing = performance.timing
    span.setData('navigationStart', timing.navigationStart)
    span.setData('loadEventEnd', timing.loadEventEnd)
    span.setData('domComplete', timing.domComplete)
    span.setData('domInteractive', timing.domInteractive)

    span.setStatus(SpanStatus.Ok)
    span.finish()
  } catch (err) {
    finishBrowserSpan(span, SpanStatus.InternalError, {
      error: toErrorMetadata(err),
    })
  }
}

/**
 * Monitor client-side navigation performance
 */
export function startNavigationMonitoring(url: string): void {
  const span = startBrowserSpan('navigation', 'navigation')

  try {
    if (!span) return

    span.setData('url', url)
    span.setStatus(SpanStatus.Ok)
    span.finish()
  } catch (err) {
    finishBrowserSpan(span, SpanStatus.InternalError, {
      error: toErrorMetadata(err),
    })
  }
}

/**
 * Monitor browser performance
 */
export async function monitorBrowserPerformance<T>(
  name: string,
  operation: () => Promise<T>,
  tags?: Record<string, unknown>
): Promise<T> {
  const span = startBrowserSpan(name, 'browser.performance', tags)

  try {
    const result = await operation()
    finishBrowserSpan(span, SpanStatus.Ok)
    return result
  } catch (err) {
    finishBrowserSpan(span, SpanStatus.InternalError, {
      error: toErrorMetadata(err),
    })
    throw err
  }
}

/**
 * Monitor route changes
 */
export function monitorRouteChange(from: string, to: string): void {
  const span = startBrowserSpan('route.change', 'navigation')

  try {
    if (!span) return

    span.setData('from', from)
    span.setData('to', to)
    span.setStatus(SpanStatus.Ok)
    span.finish()
  } catch (err) {
    finishBrowserSpan(span, SpanStatus.InternalError, {
      error: toErrorMetadata(err),
    })
  }
}

/**
 * Monitor user interactions
 */
export async function monitorUserInteraction<T>(
  name: string,
  operation: () => Promise<T>,
  tags?: Record<string, unknown>
): Promise<T> {
  const span = startBrowserSpan(name, 'user.interaction', tags)

  try {
    const result = await operation()
    finishBrowserSpan(span, SpanStatus.Ok)
    return result
  } catch (err) {
    finishBrowserSpan(span, SpanStatus.InternalError, {
      error: toErrorMetadata(err),
    })
    throw err
  }
}

/**
 * Monitor API requests
 */
export async function monitorAPIRequest<T>(
  name: string,
  operation: () => Promise<T>,
  tags?: Record<string, unknown>
): Promise<T> {
  const span = startBrowserSpan(name, 'http.client', tags)

  try {
    const result = await operation()
    finishBrowserSpan(span, SpanStatus.Ok)
    return result
  } catch (err) {
    finishBrowserSpan(span, SpanStatus.InternalError, {
      error: toErrorMetadata(err),
    })
    throw err
  }
}

/**
 * Monitor resource loading
 */
export function monitorResourceLoad(resourceType: string, url: string, duration: number): void {
  const span = startBrowserSpan('resource.load', 'resource')

  try {
    if (!span) return

    span.setData('type', resourceType)
    span.setData('url', url)
    span.setData('duration', duration)
    span.setStatus(SpanStatus.Ok)
    span.finish()
  } catch (err) {
    finishBrowserSpan(span, SpanStatus.InternalError, {
      error: toErrorMetadata(err),
    })
  }
}

export { _initializeBrowserMonitoring }
