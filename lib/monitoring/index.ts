import * as Sentry from '@sentry/nextjs';
import { type SpanContext, type Transaction } from '@sentry/types';
import { env } from '@/lib/config/environment';

interface EventHint {
  originalException: Error;
  syntheticException: Error;
}

interface MonitoringConfig {
  dsn: string;
  environment: string;
  release?: string;
  debug?: boolean;
  tracesSampleRate?: number;
}

export function initializeMonitoring(config: MonitoringConfig): void {
  Sentry.init({
    dsn: config.dsn,
    environment: config.environment,
    release: config.release,
    debug: config.debug ?? env.NODE_ENV === 'development',
    tracesSampleRate: config.tracesSampleRate ?? 1.0,
  });
}

export function captureError(error: unknown, context?: Record<string, unknown>): void {
  const eventHint: EventHint = {
    originalException: error instanceof Error ? error : new Error(String(error)),
    syntheticException: new Error(),
  };

  Sentry.captureException(error, {
    ...eventHint,
    ...context,
  });
}

export function startTransaction(
  name: string,
  op: string,
  data?: Record<string, unknown>
): Transaction {
  const transaction = Sentry.startTransaction({
    name,
    op,
    data,
  });

  Sentry.configureScope((scope) => {
    scope.setSpan(transaction);
    scope.setTransactionName(name);
  });

  return transaction;
}

export function captureTransactionError(
  transaction: Transaction,
  error: unknown,
  context?: Record<string, unknown>
): void {
  const err = error instanceof Error ? error : new Error(String(error));

  transaction.setStatus('error');
  transaction.setData('error', {
    message: err.message,
    stack: err.stack,
    ...context,
  });

  captureError(err, {
    transactionId: transaction.traceId,
    ...context,
  });
}

export function startSpan(
  transaction: Transaction,
  spanContext: SpanContext
): ReturnType<Transaction['startChild']> {
  if (!transaction) {
    return null;
  }

  return transaction.startChild(spanContext);
}
