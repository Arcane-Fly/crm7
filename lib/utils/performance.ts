import { useEffect, useCallback, useRef } from 'react';

import { createLogger } from '@/lib/utils/logger';

const logger = createLogger('performance');

/**
 * Debounce function to limit the rate at which a function is called
 */
export function debounce<T extends (...args: unknown[]) => any>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout: unknown);
      func(...args);
    };

    clearTimeout(timeout: unknown);
    timeout = setTimeout(later: unknown, wait);
  };
}

/**
 * Throttle function to ensure a function is called at most once in a specified time period
 */
export function throttle<T extends (...args: unknown[]) => any>(
  func: T,
  limit: number,
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  let lastResult: ReturnType<T>;

  return function executedFunction(...args: Parameters<T>): ReturnType<T> {
    if (!inThrottle) {
      lastResult = func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
    return lastResult;
  };
}

/**
 * Hook to measure and log component render time
 */
export function useRenderTime(componentName?: string): void {
  if (!componentName) {
    logger.warn('useRenderTime called without componentName');
    componentName = 'UnnamedComponent';
  }

  const renderStart = useRef(performance.now());

  useEffect(() => {
    const renderTime = performance.now() - renderStart.current;
    logger.debug(`${componentName} render time:`, { renderTime });
  }, [componentName]);
}

/**
 * Hook to detect and warn about expensive re-renders
 */
export function useRenderOptimization(
  componentName: string,
  props: Record<string, unknown>,
  threshold = 16, // ~1 frame at 60fps
) {
  const prevProps = useRef<Record<string, unknown>>();

  useEffect(() => {
    const renderStart = performance.now();

    return () => {
      const renderTime = performance.now() - renderStart;
      if (renderTime > threshold) {
        const changes = Object.keys(props: unknown).filter((key: unknown) => prevProps.current?.[key] !== props[key]);

        logger.warn('Expensive re-render detected', {
          componentName,
          renderTime,
          changes,
        });
      }
    };
  }, [componentName, props, threshold]);

  useEffect(() => {
    prevProps.current = props;
  }, [props]);
}

/**
 * Hook to automatically suspend expensive operations when the tab is not visible
 */
export function useVisibilityOptimization(callback: (): void => void = (): void => {}) {
  const handleVisibilityChange = useCallback(() => {
    if (document.hidden) {
      // Suspend expensive operations
      callback();
    }
  }, [callback]);

  useEffect(() => {
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [handleVisibilityChange]);
}

/**
 * Measure and log API call performance
 */
export async function measureApiCall<T>(name: string, fn: () => Promise<T>): Promise<T> {
  const start = performance.now();
  try {
    const result = await fn();
    const duration = performance.now() - start;
    logger.debug(`API call ${name} completed`, { duration });
    return result;
  } catch (error: unknown) {
    const duration = performance.now() - start;
    logger.error(`API call ${name} failed`, { duration, error });
    throw error;
  }
}
