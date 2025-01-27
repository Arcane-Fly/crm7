import { useEffect, type ReactElement } from 'react';

import { usePerformance } from '@/components/providers/PerformanceProvider';
import { createLogger } from '@/lib/utils/logger';

const logger = createLogger('PerformanceMonitor');

interface ExtendedPerformance extends Performance {
  memory?: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
}

export function PerformanceMonitor(): ReactElement | null {
  const { addMetric } = usePerformance();

  useEffect(() => {
    let mounted = true;

    const recordMetric = (type: 'pageLoad' | 'memory' | 'networkRequest', value: number) => {
      if (!mounted) return;
      try {
        addMetric({
          timestamp: Date.now(),
          value,
          type,
        });
      } catch (error) {
        logger.error('Failed to record metric', { error, type, value });
      }
    };

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'navigation') {
          recordMetric('pageLoad', entry.duration);
        } else if (entry.entryType === 'resource') {
          recordMetric('networkRequest', entry.duration);
        }
      }
    });

    try {
      observer.observe({ entryTypes: ['navigation', 'resource'] });

      // Monitor memory if available (Chrome only)
      const extendedPerformance = performance as ExtendedPerformance;
      if (extendedPerformance.memory) {
        const memoryInterval = setInterval(() => {
          recordMetric('memory', extendedPerformance.memory!.usedJSHeapSize / (1024 * 1024)); // Convert to MB
        }, 5000);

        return () => {
          mounted = false;
          observer.disconnect();
          clearInterval(memoryInterval);
        };
      }
    } catch (error) {
      logger.error('Failed to initialize PerformanceObserver', { error });
    }

    return () => {
      mounted = false;
      observer.disconnect();
    };
  }, [addMetric]);

  return null;
}
