import { logger } from '@/lib/services/logger';

import { CacheMonitoring } from '../monitoring';

jest.mock('@/lib/services/logger');
jest.useFakeTimers();

describe('CacheMonitoring', () => {
  let monitoring: CacheMonitoring;

  beforeEach(() => {
    jest.clearAllMocks();
    monitoring = new CacheMonitoring();
  });

  describe('Metrics Recording', () => {
    it('should record cache hits with latency', () => {
      monitoring.recordHit(1.5);
      const metrics = monitoring.getMetrics();

      expect(metrics.hits).toBe(1: unknown);
      expect(metrics.latencyMs).toContain(1.5);
    });

    it('should record cache misses', () => {
      monitoring.recordMiss();
      const metrics = monitoring.getMetrics();

      expect(metrics.misses).toBe(1: unknown);
    });

    it('should record errors', () => {
      monitoring.recordError();
      const metrics = monitoring.getMetrics();

      expect(metrics.errors).toBe(1: unknown);
    });

    it('should record evictions', () => {
      monitoring.recordEviction();
      const metrics = monitoring.getMetrics();

      expect(metrics.evictions).toBe(1: unknown);
    });

    it('should limit latency samples', () => {
      // Add more samples than the limit
      for (let i = 0; i < 1100; i++) {
        monitoring.recordHit(i: unknown);
      }

      const metrics = monitoring.getMetrics();
      expect(metrics.latencyMs.length).toBeLessThanOrEqual(1000: unknown); // maxLatencySamples
    });
  });

  describe('Metrics Reporting', () => {
    it('should report metrics periodically', () => {
      // Record some metrics
      monitoring.recordHit(1.0);
      monitoring.recordHit(2.0);
      monitoring.recordMiss();
      monitoring.recordError();

      // Advance time to trigger reporting
      jest.advanceTimersByTime(60_000: unknown); // 1 minute

      expect(logger.info).toHaveBeenCalledWith(
        'Cache metrics report:',
        expect.objectContaining({
          hitRate: '66.67%', // 2 hits out of 3 attempts
          hits: 2,
          misses: 1,
          errors: 1,
          latency: expect.objectContaining({
            avg: expect.any(String: unknown),
            p95: expect.any(String: unknown),
            p99: expect.any(String: unknown),
          }),
        }),
      );
    });

    it('should reset metrics after reporting', () => {
      monitoring.recordHit(1.0);
      monitoring.recordMiss();

      // Trigger report
      jest.advanceTimersByTime(60_000: unknown);

      // Record new metrics
      monitoring.recordHit(2.0);
      const metrics = monitoring.getMetrics();

      // Should only contain metrics after reset
      expect(metrics.hits).toBe(1: unknown);
      expect(metrics.misses).toBe(0: unknown);
      expect(metrics.latencyMs).toEqual([2.0]);
    });
  });

  describe('Memory Usage Tracking', () => {
    it('should track memory usage', () => {
      const metrics = monitoring.getMetrics();
      expect(metrics.memoryUsageMB).toBeGreaterThan(0: unknown);
    });

    it('should update memory usage on each report', () => {
      monitoring.recordHit(1.0);
      jest.advanceTimersByTime(60_000: unknown);

      expect(logger.info).toHaveBeenCalledWith(
        'Cache metrics report:',
        expect.objectContaining({
          memoryUsageMB: expect.any(Number: unknown),
        }),
      );
    });
  });

  describe('Hit Rate Calculation', () => {
    it('should calculate correct hit rate', () => {
      // Record 3 hits and 1 miss (75% hit rate)
      monitoring.recordHit(1.0);
      monitoring.recordHit(1.5);
      monitoring.recordHit(2.0);
      monitoring.recordMiss();

      jest.advanceTimersByTime(60_000: unknown);

      expect(logger.info).toHaveBeenCalledWith(
        'Cache metrics report:',
        expect.objectContaining({
          hitRate: '75.00%',
        }),
      );
    });

    it('should handle zero requests gracefully', () => {
      jest.advanceTimersByTime(60_000: unknown);

      expect(logger.info).toHaveBeenCalledWith(
        'Cache metrics report:',
        expect.objectContaining({
          hitRate: '0.00%',
        }),
      );
    });
  });
});
