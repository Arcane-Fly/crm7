import { useCallback, useEffect, useRef } from 'react';

export function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export function throttle<T extends (...args: any[]) => void>(
  func: T,
  limit: number,
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  let lastFunc: NodeJS.Timeout;
  let lastRan: number;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      lastRan = Date.now();
      inThrottle = true;
    } else {
      clearTimeout(lastFunc);
      lastFunc = setTimeout(() => {
        if (Date.now() - lastRan >= limit) {
          func(...args);
          lastRan = Date.now();
        }
      }, limit - (Date.now() - lastRan));
    }
  };
}

export function useRenderTime(componentName: string): void {
  const startTime = useRef(performance.now());

  useEffect(() => {
    const endTime = performance.now();
    const renderTime = endTime - startTime.current;
    console.log(`${componentName} render time: ${renderTime.toFixed(2)}ms`);
  });
}

export function useRenderOptimization<T extends Record<string, unknown>>(
  props: T,
  componentName: string,
): void {
  const prevProps = useRef<T>();

  useEffect(() => {
    if (prevProps.current) {
      const changes = Object.keys(props).filter((key) => prevProps.current?.[key] !== props[key]);
      if (changes.length > 0) {
        console.log(`${componentName} re-rendered due to changes in:`, changes);
      }
    }
    prevProps.current = props;
  });
}

export function useVisibilityOptimization(callback = () => {}): void {
  const isVisible = useRef(true);

  const handleVisibilityChange = useCallback(() => {
    isVisible.current = document.visibilityState === 'visible';
    if (isVisible.current) {
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

export async function measureApiCall<T>(
  apiCall: () => Promise<T>,
  name: string,
): Promise<T> {
  const start = performance.now();
  try {
    const result = await apiCall();
    const end = performance.now();
    console.log(`${name} took ${(end - start).toFixed(2)}ms`);
    return result;
  } catch (error) {
    const end = performance.now();
    console.error(`${name} failed after ${(end - start).toFixed(2)}ms`, error);
    throw error;
  }
}
