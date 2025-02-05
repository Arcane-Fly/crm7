'use client';

import { useEffect } from 'react';
import { usePerformance } from '@/hooks/use-performance';

export function PerformanceMonitor(): null {
  const { startMonitoring, stopMonitoring } = usePerformance();

  useEffect((): () => void => {
    const memoryInterval = startMonitoring();
    return (): void => {
      clearInterval(memoryInterval);
      stopMonitoring();
    };
  }, [startMonitoring, stopMonitoring]);

  return null;
}
