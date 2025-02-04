export interface CacheMetrics {
  avg: number;
  p95: number;
  p99: number;
  hitRate: number;
  hits?: number;
  misses?: number;
}

import type { PerformanceAction, PerformanceState } from '@/lib/reducers/performance';
import type { Dispatch } from 'react';

export interface PerformanceContextType {
  state: PerformanceState;
  dispatch: Dispatch<PerformanceAction>;
}

export interface CacheMetrics {
  avg: number;
  p95: number;
  p99: number;
  hitRate: number;
  hits?: number;
  misses?: number;
}

export interface WarmingStats {
  count: number;
  // Add additional properties if needed
}
