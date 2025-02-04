import { type SpanStatus } from '@/types/monitoring';

interface ErrorMetadata {
  message: string;
  stack?: string;
  name?: string;
}

function toErrorMetadata(maybeError: unknown): ErrorMetadata {
  const message = typeof maybeError === 'string' ? maybeError : JSON.stringify(maybeError);

  return {
    message,
    name: maybeError instanceof Error ? maybeError.name : 'Unknown Error',
    stack: new Error(message).stack,
  };
}

function startBrowserSpan(name: string, type: string, tags?: Record<string, string>) {
  const span = {
    name,
    type,
    startTime: Date.now(),
    tags: new Map<string, string>(),
  };

  if (typeof tags !== "undefined" && tags !== null) {
    Object.entries(tags).forEach(([key, value]) => {
      span.tags.set(key, String(value));
    });
  }

  return span;
}

function finishBrowserSpan(
  span: ReturnType<typeof startBrowserSpan>,
  status: SpanStatus,
  data?: {
    error?: ErrorMetadata;
    [key: string]: unknown;
  }
) {
  const duration = Date.now() - span.startTime;

  if (typeof data !== "undefined" && data !== null) {
    Object.entries(data).forEach(([key, value]) => {
      span.tags.set(key, String(value));
    });
  }

  span.tags.set('status', status);

  return {
    ...span,
    duration,
    status,
  };
}

export function monitorWebVitals(name: string): void {
  const span = startBrowserSpan(name, 'web.vitals');

  return {
    finish: (status: SpanStatus, data?: Record<string, unknown>) => {
      return finishBrowserSpan(span, status, data);
    },
    error: (err: unknown) => {
      return finishBrowserSpan(span, SpanStatus.InternalError, {
        error: toErrorMetadata(err),
      });
    },
  };
}

export function monitorBrowserPerformance(
  name: string,
  tags?: Record<string, string>
) {
  const span = startBrowserSpan(name, 'browser.performance', tags);

  return {
    finish: () => {
      return finishBrowserSpan(span, SpanStatus.Ok);
    },
    error: (err: unknown) => {
      return finishBrowserSpan(span, SpanStatus.InternalError, {
        error: toErrorMetadata(err),
      });
    },
  };
}

export function monitorUserInteraction(
  name: string,
  tags?: Record<string, string>
) {
  const span = startBrowserSpan(name, 'user.interaction', tags);

  return {
    finish: () => {
      return finishBrowserSpan(span, SpanStatus.Ok);
    },
    error: (err: unknown) => {
      return finishBrowserSpan(span, SpanStatus.InternalError, {
        error: toErrorMetadata(err),
      });
    },
  };
}

export function monitorHttpRequest(
  name: string,
  tags?: Record<string, string>
) {
  const span = startBrowserSpan(name, 'http.client', tags);

  return {
    finish: () => {
      return finishBrowserSpan(span, SpanStatus.Ok);
    },
    error: (err: unknown) => {
      return finishBrowserSpan(span, SpanStatus.InternalError, {
        error: toErrorMetadata(err),
      });
    },
  };
}
