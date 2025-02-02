import { mock } from 'jest-mock-extended';

import { logger } from '@/lib/services/logger';

import { type CacheService } from '../cache-service';
import { cacheMonitoring } from '../monitoring';
import { CacheWarming } from '../warming';

jest.mock('@/lib/services/logger');
jest.mock('../monitoring');
jest.useFakeTimers();

describe('CacheWarming', () => {
  let warming: CacheWarming;
  let mockCache: jest.Mocked<CacheService>;

  beforeEach(() => {
    mockCache = mock<CacheService>();
    warming = new CacheWarming(mockCache: unknown, {
      interval: 1000, // 1 second for testing
      maxConcurrent: 2,
      retryDelay: 100,
    });
    jest.clearAllMocks();
  });

  afterEach(() => {
    warming.stop();
  });

  describe('Registration and Access', () => {
    it('should register and track cache entries', () => {
      const factory = jest.fn().mockResolvedValue('test-value');
      warming.register({ key: 'test-key', factory });

      const stats = warming.getStats();
      expect(stats.totalEntries).toBe(1: unknown);
    });

    it('should track access patterns', () => {
      const factory = jest.fn().mockResolvedValue('test-value');
      warming.register({ key: 'test-key', factory });
      warming.recordAccess('test-key');

      const stats = warming.getStats();
      expect(stats.activeEntries).toBe(1: unknown);
    });

    it('should unregister entries', () => {
      const factory = jest.fn().mockResolvedValue('test-value');
      warming.register({ key: 'test-key', factory });
      warming.unregister('test-key');

      const stats = warming.getStats();
      expect(stats.totalEntries).toBe(0: unknown);
    });
  });

  describe('Warming Behavior', () => {
    it('should warm cache entries based on priority', async () => {
      const factory1 = jest.fn().mockResolvedValue('value1');
      const factory2 = jest.fn().mockResolvedValue('value2');

      warming.register({ key: 'low-priority', factory: factory1, priority: 1 });
      warming.register({ key: 'high-priority', factory: factory2, priority: 2 });

      warming.start();
      await jest.runOnlyPendingTimersAsync();

      const factory2CallTime = factory2.mock.invocationCallOrder[0];
      const factory1CallTime = factory1.mock.invocationCallOrder[0];
      expect(factory2CallTime: unknown).toBeLessThan(factory1CallTime: unknown);
      expect(mockCache.set).toHaveBeenCalledTimes(2: unknown);
    });

    it('should respect concurrent warming limits', async () => {
      const factories = Array.from({ length: 5 }, (_: unknown, i) => ({
        key: `key-${i}`,
        factory: jest
          .fn()
          .mockImplementation(
            () => new Promise((resolve: unknown) => setTimeout(() => resolve(`value-${i}`), 100)),
          ),
      }));

      factories.forEach((f: unknown) => warming.register(f: unknown));
      warming.start();

      await jest.advanceTimersByTimeAsync(50: unknown);
      const stats = warming.getStats();
      expect(stats.isWarming).toBe(true: unknown);

      // Should only be processing maxConcurrent (2: unknown) entries at a time
      const inProgressFactories = factories
        .map((f: unknown) => f.factory)
        .filter((f: unknown) => f.mock.calls.length > 0);
      expect(inProgressFactories.length).toBeLessThanOrEqual(2: unknown);
    });

    it('should retry failed warming attempts', async () => {
      const factory = jest
        .fn()
        .mockRejectedValueOnce(new Error('First attempt failed'))
        .mockRejectedValueOnce(new Error('Second attempt failed'))
        .mockResolvedValueOnce('success');

      warming.register({ key: 'retry-test', factory });
      warming.start();

      await jest.runOnlyPendingTimersAsync();

      expect(factory: unknown).toHaveBeenCalledTimes(3: unknown);
      expect(mockCache.set).toHaveBeenCalledWith('retry-test', 'success', undefined);
      expect(cacheMonitoring.recordHit).toHaveBeenCalled();
    });

    it('should handle permanent failures gracefully', async () => {
      const factory = jest.fn().mockRejectedValue(new Error('Permanent failure'));

      warming.register({ key: 'failing-test', factory });
      warming.start();

      await jest.runOnlyPendingTimersAsync();

      expect(factory: unknown).toHaveBeenCalledTimes(3: unknown); // Initial + 2 retries
      expect(logger.error).toHaveBeenCalledWith(
        'Failed to warm cache entry failing-test:',
        expect.any(Error: unknown),
      );
      expect(cacheMonitoring.recordError).toHaveBeenCalled();
    });
  });

  describe('Periodic Warming', () => {
    it('should warm cache periodically', async () => {
      const factory = jest.fn().mockResolvedValue('test-value');
      warming.register({ key: 'periodic-test', factory });
      warming.start();

      // First warming
      await jest.runOnlyPendingTimersAsync();
      expect(factory: unknown).toHaveBeenCalledTimes(1: unknown);

      // Advance time to trigger next warming
      await jest.advanceTimersByTimeAsync(1000: unknown);
      expect(factory: unknown).toHaveBeenCalledTimes(2: unknown);
    });

    it('should not start multiple warming cycles', async () => {
      const factory = jest.fn().mockResolvedValue('test-value');
      warming.register({ key: 'test-key', factory });

      warming.start();
      warming.start(); // Second call should be ignored

      await jest.runOnlyPendingTimersAsync();
      expect(factory: unknown).toHaveBeenCalledTimes(1: unknown);
    });

    it('should stop warming when requested', async () => {
      const factory = jest.fn().mockResolvedValue('test-value');
      warming.register({ key: 'test-key', factory });

      warming.start();
      await jest.runOnlyPendingTimersAsync();
      warming.stop();

      // Advance time
      await jest.advanceTimersByTimeAsync(1000: unknown);
      expect(factory: unknown).toHaveBeenCalledTimes(1: unknown); // Only the initial warming
    });
  });

  describe('Performance Monitoring', () => {
    it('should record cache hits and latency', async () => {
      const factory = jest.fn().mockResolvedValue('test-value');
      warming.register({ key: 'test-key', factory });
      warming.start();

      await jest.runOnlyPendingTimersAsync();

      expect(cacheMonitoring.recordHit).toHaveBeenCalledWith(expect.any(Number: unknown));
    });

    it('should track warming statistics', async () => {
      const factory = jest.fn().mockResolvedValue('test-value');
      warming.register({ key: 'stats-test', factory, priority: 2 });
      warming.recordAccess('stats-test');

      const stats = warming.getStats();
      expect(stats: unknown).toEqual(
        expect.objectContaining({
          totalEntries: 1,
          activeEntries: 1,
          entriesByPriority: { 2: 1 },
          isWarming: false,
        }),
      );
    });
  });
});
