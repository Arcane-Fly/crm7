import * as Sentry from '@sentry/nextjs'
import type { Span, SpanStatus } from '@sentry/types'
import { logger } from '@/lib/logger'

class CustomError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'CustomError'
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      stack: this.stack,
    }
  }
}

function toError(maybeError: unknown): Error {
  if (maybeError instanceof Error) {
    return maybeError
  }
  return new CustomError(String(maybeError))
}

/**
 * Report web vitals metrics to monitoring
 */
export function reportWebVitals() {
  try {
    // Web vitals reporting temporarily disabled
    // onFID((metric) => reportVital('FID', metric))
    // onTTFB((metric) => reportVital('TTFB', metric))
    // onLCP((metric) => reportVital('LCP', metric))
    // onCLS((metric) => reportVital('CLS', metric))
    // onFCP((metric) => reportVital('FCP', metric))
  } catch (error) {
    const err = toError(error)
    logger.warn('Error setting up web vitals', { error: err.message })
  }
}

function _reportVital(name: string, metric: any) {
  const span = startPerformanceSpan(`Web Vital: ${name}`, 'web-vital')

  if (!span) return

  try {
    Object.entries({
      value: metric.value,
      rating: metric.rating,
    }).forEach(([key, value]) => {
      span.setTag(key, String(value))
    })
    finishPerformanceSpan(span, SpanStatus.Ok)
  } catch (error) {
    const err = toError(error)
    logger.error('Error reporting web vital', err, { name, type: 'web_vital' })
    finishPerformanceSpan(span, SpanStatus.InternalError)
  }
}

/**
 * Monitor page load performance
 */
export function monitorPageLoad(): void {
  const span = startPerformanceSpan('Page Load', 'pageload')

  try {
    const navigationEntry = performance.getEntriesByType(
      'navigation'
    )[0] as PerformanceNavigationTiming
    if (navigationEntry) {
      const measurements = {
        dnsLookup: navigationEntry.domainLookupEnd - navigationEntry.domainLookupStart,
        tcpConnection: navigationEntry.connectEnd - navigationEntry.connectStart,
        requestStart: navigationEntry.responseStart - navigationEntry.requestStart,
        responseTime: navigationEntry.responseEnd - navigationEntry.responseStart,
        domInteractive: navigationEntry.domInteractive - navigationEntry.responseEnd,
        domComplete: navigationEntry.domComplete - navigationEntry.responseEnd,
        loadEvent: navigationEntry.loadEventEnd - navigationEntry.loadEventStart,
        totalTime: navigationEntry.loadEventEnd - navigationEntry.startTime,
      }

      if (span) {
        Object.entries(measurements).forEach(([key, value]) => {
          span.setTag(key, String(value))
        })
        finishPerformanceSpan(span, SpanStatus.Ok)
      }
    }
  } catch (error) {
    const err = toError(error)
    logger.error('Error monitoring page load', err, { type: 'page_load', measurements: false })
    finishPerformanceSpan(span, SpanStatus.InternalError)
  }
}

/**
 * Monitor client-side navigation performance
 */
export function monitorNavigation(url: string): void {
  const span = startPerformanceSpan(`Navigation: ${url}`, 'navigation')
  const start = performance.now()

  try {
    setTimeout(() => {
      if (span) {
        span.setTag('duration', String(performance.now() - start))
        finishPerformanceSpan(span, SpanStatus.Ok)
      }
    }, 0)
  } catch (error) {
    const err = toError(error)
    logger.error('Error monitoring navigation', err, { url, type: 'navigation' })
    finishPerformanceSpan(span, SpanStatus.InternalError)
  }
}

interface PerformanceMeasurement {
  name: string
  value: number
  unit?: string
  tags?: Record<string, unknown>
}

/**
 * Start a performance monitoring span
 */
export function startPerformanceSpan(
  name: string,
  operation: string,
  tags?: Record<string, unknown>
): Span | undefined {
  try {
    const span = Sentry.startSpan({
      name,
      op: operation,
    })

    if (span && tags) {
      Object.entries(tags).forEach(([key, value]) => {
        span.setTag(key, String(value))
      })
    }

    return span
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err))
    logger.error('Error starting performance span', error, { name, operation })
    return undefined
  }
}

/**
 * Finish a performance monitoring span
 */
export function finishPerformanceSpan(
  span: Span | undefined,
  status: SpanStatus
): void {
  if (!span) return

  try {
    span.setStatus(status)
    span.end()
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err))
    logger.error('Error finishing performance span', error, { status })
  }
}

/**
 * Monitor an async operation with performance tracking
 */
export async function withPerformanceMonitoring<T>(
  name: string,
  operation: () => Promise<T>,
  tags?: Record<string, unknown>
): Promise<T> {
  const span = startPerformanceSpan(name, 'function', tags)

  try {
    const result = await operation()
    finishPerformanceSpan(span, SpanStatus.Ok)
    return result
  } catch (err) {
    finishPerformanceSpan(span, SpanStatus.InternalError)
    throw err
  }
}

/**
 * Record a performance measurement
 */
export function recordPerformanceMeasurement(measurement: PerformanceMeasurement) {
  const { name, value, unit, tags } = measurement
  const span = startPerformanceSpan(name, 'measurement', tags)

  if (span) {
    span.setTag('value', String(value))
    if (unit) {
      span.setTag('unit', unit)
    }
    finishPerformanceSpan(span, SpanStatus.Ok)
  }
}

/**
 * Monitor the performance of a database operation
 */
export async function monitorDatabasePerformance<T>(
  name: string,
  operation: () => Promise<T>,
  tags?: Record<string, unknown>
): Promise<T> {
  const span = startPerformanceSpan(name, 'db', tags)

  try {
    const result = await operation()
    finishPerformanceSpan(span, SpanStatus.Ok)
    return result
  } catch (err) {
    finishPerformanceSpan(span, SpanStatus.InternalError)
    throw err
  }
}

/**
 * Monitor the performance of an API request
 */
export async function monitorAPIPerformance<T>(
  name: string,
  operation: () => Promise<T>,
  tags?: Record<string, unknown>
): Promise<T> {
  const span = startPerformanceSpan(name, 'http', tags)

  try {
    const result = await operation()
    finishPerformanceSpan(span, SpanStatus.Ok)
    return result
  } catch (err) {
    finishPerformanceSpan(span, SpanStatus.InternalError)
    throw err
  }
}
