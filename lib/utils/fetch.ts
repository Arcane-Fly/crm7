import { logger } from './logger';

export interface RetryConfig {
  maxRetries: number;
  initialDelay: number;
  maxDelay: number;
  backoffFactor: number;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  backoffFactor: 2,
};

export async function fetch(
  url: string | URL | Request,
  init?: RequestInit & { retry?: Partial<RetryConfig> }
): Promise<Response> {
  const retryConfig = { ...DEFAULT_RETRY_CONFIG, ...init?.retry };
  let lastError: Error | null = null;
  let attempt = 0;

  while (attempt <= retryConfig.maxRetries) {
    try {
      const response = await globalThis.fetch(url, init);
      if (response.ok || attempt === retryConfig.maxRetries) {
        return response;
      }

      lastError = new Error(`HTTP ${response.status}: ${response.statusText}`);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error occurred');
    }

    attempt += 1;
    if (attempt <= retryConfig.maxRetries) {
      const delay = Math.min(
        retryConfig.initialDelay * Math.pow(retryConfig.backoffFactor, attempt - 1),
        retryConfig.maxDelay
      );

      logger.warn('Request failed, retrying', {
        url: url.toString(),
        attempt,
        delay,
        error: lastError,
      });

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}
