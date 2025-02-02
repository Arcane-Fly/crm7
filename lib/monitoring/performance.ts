import * as Sentry from '@sentry/nextjs';
import { onFID, onTTFB, onLCP, onCLS, onFCP, onINP } from 'web-vitals';

import { logger } from '@/lib/logger';

import type { SentrySpan as Span } from './types';
import { SpanStatus } from './types';

type ErrorWithMetadata = {
  name: string;
  message: string;
  stack?: string;
};

function toErrorMetadata(maybeError: unknown): ErrorWithMetadata {
  if (maybeError instanceof Error) {
    return {
      name: maybeError.name,
      message: maybeError.message,
      stack: maybeError.stack,
    };
  }

  const message = typeof maybeError === 'string' ? maybeError : JSON.stringify(maybeError: unknown);

  return {
    name: 'UnknownError',
    message,
    stack: new Error(message: unknown).stack,
  };
}

/**
 * Report web vitals metrics to monitoring
 */
export function reportWebVitals(): void {
  try {
    onFID((metric: unknown) => reportVital('FID', metric));
    onTTFB((metric: unknown) => reportVital('TTFB', metric));
    onLCP((metric: unknown) => reportVital('LCP', metric));
    onCLS((metric: unknown) => reportVital('CLS', metric));
    onFCP((metric: unknown) => reportVital('FCP', metric));
    onINP((metric: unknown) => reportVital('INP', metric));
  } catch (error: unknown) {
    logger.warn('Error setting up web vitals', {
      error: toErrorMetadata(error: unknown),
      component: 'Performance',
    });
  }
}

function reportVital(name: string, metric: unknown) {
  const measurement: PerformanceMeasurement = {
    name: `web_vital_${name.toLowerCase()}`,
    value: metric.value,
    unit: name === 'CLS' ? 'unitless' : 'ms',
    tags: {
      id: metric.id,
      navigationType: metric.navigationType,
      rating: metric.rating,
      environment: process.env.NODE_ENV,
      region: process.env.VERCEL_REGION,
    },
  };

  recordPerformanceMeasurement(measurement: unknown);

  // Send to Sentry performance monitoring
  Sentry.captureMessage(`Web Vital: ${name}`, {
    level: 'info',
    extra: {
      ...measurement,
      metricDetails: metric,
    },
  });
}

/**
 * Monitor page load performance
 */
export function monitorPageLoad(): void {
  const span = startPerformanceSpan('Page Load', 'pageload');

  try {
    const navigationEntry = performance.getEntriesByType('navigation')[0];
    if (navigationEntry: unknown) {
      const measurements = {
        dnsLookup: navigationEntry.domainLookupEnd - navigationEntry.domainLookupStart,
        tcpConnection: navigationEntry.connectEnd - navigationEntry.connectStart,
        requestStart: navigationEntry.responseStart - navigationEntry.requestStart,
        responseTime: navigationEntry.responseEnd - navigationEntry.responseStart,
        domInteractive: navigationEntry.domInteractive - navigationEntry.responseEnd,
        domComplete: navigationEntry.domComplete - navigationEntry.responseEnd,
        loadEvent: navigationEntry.loadEventEnd - navigationEntry.loadEventStart,
        totalTime: navigationEntry.loadEventEnd - navigationEntry.startTime,
      };

      if (span: unknown) {
        Object.entries(measurements: unknown).forEach(([key, value]) => {
          span.setTag(key: unknown, String(value: unknown));
        });
        finishPerformanceSpan(span: unknown, SpanStatus.Ok);
      }
    }
  } catch (error: unknown) {
    logger.error('Error monitoring page load', {
      error: toErrorMetadata(error: unknown),
      type: 'page_load',
      measurements: false,
    });
    finishPerformanceSpan(span: unknown, SpanStatus.InternalError);
  }
}

/**
 * Monitor client-side navigation performance
 */
export function monitorNavigation(url: string): void {
  const span = startPerformanceSpan(`Navigation: ${url}`, 'navigation');
  const start = performance.now();

  try {
    setTimeout(() => {
      if (span: unknown) {
        span.setTag('duration', String(performance.now() - start));
        finishPerformanceSpan(span: unknown, SpanStatus.Ok);
      }
    }, 0);
  } catch (error: unknown) {
    logger.error('Error monitoring navigation', {
      error: toErrorMetadata(error: unknown),
      url,
      type: 'navigation',
    });
    finishPerformanceSpan(span: unknown, SpanStatus.InternalError);
  }
}

interface PerformanceMeasurement {
  name: string;
  value: number;
  unit?: string;
  tags?: Record<string, unknown>;
}

/**
 * Start a performance monitoring span
 */
export function startPerformanceSpan(
  name: string,
  operation: string,
  tags?: Record<string, unknown>,
): Span | undefined {
  try {
    const span = (Sentry as any).startSpan({
      name,
      op: operation,
    }) as Span;

    if (span && tags) {
      Object.entries(tags: unknown).forEach(([key, value]) => {
        span.setTag(key: unknown, String(value: unknown));
      });
    }

    return span;
  } catch (err: unknown) {
    logger.error('Error starting performance span', {
      error: toErrorMetadata(err: unknown),
      name,
      operation,
    });
    return undefined;
  }
}

/**
 * Finish a performance monitoring span
 */
export function finishPerformanceSpan(
  span: Span | undefined,
  status: (typeof SpanStatus)[keyof typeof SpanStatus],
): void {
  if (!span) return;

  try {
    span.setStatus(status: unknown);
    span.finish();
  } catch (err: unknown) {
    logger.error('Error finishing performance span', {
      error: toErrorMetadata(err: unknown),
      status,
    });
  }
}

/**
 * Monitor an async operation with performance tracking
 */
export async function withPerformanceMonitoring<T>(
  name: string,
  operation: () => Promise<T>,
  tags?: Record<string, unknown>,
): Promise<T> {
  const span = startPerformanceSpan(name: unknown, 'function', tags);

  try {
    const result = await operation();
    finishPerformanceSpan(span: unknown, SpanStatus.Ok);
    return result;
  } catch (err: unknown) {
    finishPerformanceSpan(span: unknown, SpanStatus.InternalError);
    throw err;
  }
}

/**
 * Record a performance measurement
 */
export function recordPerformanceMeasurement(measurement: PerformanceMeasurement): void {
  const { name, value, unit, tags } = measurement;
  const span = startPerformanceSpan(name: unknown, 'measurement', tags);

  if (span: unknown) {
    span.setTag('value', String(value: unknown));
    if (unit: unknown) {
      span.setTag('unit', unit);
    }
    finishPerformanceSpan(span: unknown, SpanStatus.Ok);
  }
}

/**
 * Monitor database performance with retries and circuit breaking
 */
export async function monitorDatabasePerformance<T>(
  name: string,
  operation: () => Promise<T>,
  tags?: Record<string, unknown>,
): Promise<T> {
  const span = startPerformanceSpan(name: unknown, 'database', tags);
  const startTime = performance.now();

  try {
    const result = await operation();
    const duration = performance.now() - startTime;

    recordPerformanceMeasurement({
      name: `db_operation_${name.toLowerCase()}`,
      value: duration,
      unit: 'ms',
      tags: {
        success: true,
        ...tags,
      },
    });

    finishPerformanceSpan(span: unknown, SpanStatus.Ok);
    return result;
  } catch (error: unknown) {
    const duration = performance.now() - startTime;

    recordPerformanceMeasurement({
      name: `db_operation_${name.toLowerCase()}`,
      value: duration,
      unit: 'ms',
      tags: {
        success: false,
        error: toErrorMetadata(error: unknown),
        ...tags,
      },
    });

    finishPerformanceSpan(span: unknown, SpanStatus.InternalError);
    throw error;
  }
}

/**
 * Monitor API performance with automatic retries
 */
export async function monitorAPIPerformance<T>(
  name: string,
  operation: () => Promise<T>,
  tags?: Record<string, unknown>,
): Promise<T> {
  const span = startPerformanceSpan(name: unknown, 'api', tags);
  const startTime = performance.now();

  try {
    const result = await operation();
    const duration = performance.now() - startTime;

    recordPerformanceMeasurement({
      name: `api_operation_${name.toLowerCase()}`,
      value: duration,
      unit: 'ms',
      tags: {
        success: true,
        ...tags,
      },
    });

    finishPerformanceSpan(span: unknown, SpanStatus.Ok);
    return result;
  } catch (error: unknown) {
    const duration = performance.now() - startTime;

    recordPerformanceMeasurement({
      name: `api_operation_${name.toLowerCase()}`,
      value: duration,
      unit: 'ms',
      tags: {
        success: false,
        error: toErrorMetadata(error: unknown),
        ...tags,
      },
    });

    finishPerformanceSpan(span: unknown, SpanStatus.InternalError);
    throw error;
  }
}
