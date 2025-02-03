import { useEffect } from 'react';
import { usePerformance } from '@/hooks/use-performance';

export function PerformanceMonitor(): null {
  const { startMonitoring, stopMonitoring } = usePerformance();

  useEffect(() => {
    const memoryInterval = startMonitoring();
    return () => {
      clearInterval(memoryInterval);
      stopMonitoring();
    };
  }, [startMonitoring, stopMonitoring]);

  return null;
}
