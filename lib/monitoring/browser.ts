import * as Sentry from '@sentry/nextjs'
import type { Span, SpanStatus, Transaction } from '@sentry/types'
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
  if (maybeError instanceof Error) return maybeError

  try {
    return new CustomError(typeof maybeError === 'string' ? maybeError : JSON.stringify(maybeError))
  } catch {
    return new CustomError(String(maybeError))
  }
}

function startBrowserSpan(
  name: string,
  operation: string,
  tags?: Record<string, unknown>
): Transaction | undefined {
  try {
    const span = Sentry.startTransaction({
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
    const error = toError(err)
    logger.error('Error starting browser span:', { error: error.toJSON() })
    return undefined
  }
}

function finishBrowserSpan(
  span: Transaction | undefined,
  status: SpanStatus,
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
    const error = toError(err)
    logger.error('Error finishing browser span:', { error: error.toJSON() })
  }
}

/**
 * Initialize browser monitoring
 */
function initializeBrowserMonitoring(): void {
  try {
    const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN
    if (!dsn) {
      logger.warn('Sentry DSN not configured', { status: 'disabled' }, 'BrowserMonitoring')
      return
    }

    Sentry.init({
      dsn,
      environment: process.env.NEXT_PUBLIC_ENVIRONMENT,
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
      integrations: [
        new Sentry.BrowserTracing(),
      ],
    })

    logger.info(
      'Browser monitoring initialized',
      { status: 'initialized', dsn },
      'BrowserMonitoring'
    )
  } catch (err) {
    const error = toError(err)
    logger.error('Failed to initialize browser monitoring:', { error: error.toJSON() })
  }
}

/**
 * Report web vitals metrics to monitoring
 */
export function reportWebVitals(): void {
  try {
    // onFID((metric) => reportVital('FID', metric))
    // onTTFB((metric) => reportVital('TTFB', metric))
    // onLCP((metric) => reportVital('LCP', metric))
    // onCLS((metric) => reportVital('CLS', metric))
    // onFCP((metric) => reportVital('FCP', metric))
  } catch (error) {
    const err = toError(error)
    logger.warn(
      'Error setting up web vitals',
      { error: err.message, status: 'failed' },
      'BrowserMonitoring'
    )
  }
}

function reportVital(name: string, metric: any): void {
  const span = startBrowserSpan(name, 'web.vitals')
  
  try {
    if (!span) return

    span.setData('value', metric.value)
    span.setData('rating', metric.rating)
    span.setData('delta', metric.delta)
    span.setData('navigationType', metric.navigationType)

    span.setStatus('ok')
    span.finish()
  } catch (err) {
    const error = toError(err)
    logger.error('Error reporting vital:', { error: error.toJSON() })
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

    span.setStatus('ok')
    span.finish()
  } catch (err) {
    const error = toError(err)
    finishBrowserSpan(span, 'error', { error: error.toJSON() })
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
    span.setStatus('ok')
    span.finish()
  } catch (err) {
    const error = toError(err)
    finishBrowserSpan(span, 'error', { error: error.toJSON() })
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
    finishBrowserSpan(span, 'ok')
    return result
  } catch (err) {
    const error = toError(err)
    finishBrowserSpan(span, 'error', { error: error.toJSON() })
    throw error
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
    span.setStatus('ok')
    span.finish()
  } catch (err) {
    const error = toError(err)
    finishBrowserSpan(span, 'error', { error: error.toJSON() })
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
    finishBrowserSpan(span, 'ok')
    return result
  } catch (err) {
    const error = toError(err)
    finishBrowserSpan(span, 'error', { error: error.toJSON() })
    throw error
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
    finishBrowserSpan(span, 'ok')
    return result
  } catch (err) {
    const error = toError(err)
    finishBrowserSpan(span, 'error', { error: error.toJSON() })
    throw error
  }
}

/**
 * Monitor resource loading
 */
export function monitorResourceLoad(
  resourceType: string,
  url: string,
  duration: number
): void {
  const span = startBrowserSpan('resource.load', 'resource')
  
  try {
    if (!span) return

    span.setData('type', resourceType)
    span.setData('url', url)
    span.setData('duration', duration)
    span.setStatus('ok')
    span.finish()
  } catch (err) {
    const error = toError(err)
    finishBrowserSpan(span, 'error', { error: error.toJSON() })
  }
}
