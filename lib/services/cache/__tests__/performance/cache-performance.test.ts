import { CacheService } from '@/lib/services/cache/cache-service';
import { FairWorkCacheMiddleware } from '@/lib/services/fairwork/cache-middleware';
import type { RateCalculationRequest } from '@/lib/services/fairwork/types';

describe('Cache Performance Tests', () => {
  let cache: CacheService;
  let cacheMiddleware: FairWorkCacheMiddleware;

  const mockRequest: RateCalculationRequest = {
    awardCode: 'TEST001',
    classificationCode: 'L1',
    employmentType: 'permanent',
    date: new Date('2025-01-29'),
    hours: 38,
  };

  beforeEach(async () => {
    cache = new CacheService({ prefix: 'perf-test:', ttl: 3600 });
    cacheMiddleware = new FairWorkCacheMiddleware();
    await cache.clear(); // Start with clean cache
  });

  afterEach(async () => {
    await cache.close();
  });

  describe('Cache Response Times', () => {
    it('should have sub-millisecond cache hits', async () => {
      const value = { result: 'test-data' };
      const key = 'perf-test-key';

      // Prime the cache
      await cache.set(key, value);

      const start = process.hrtime.bigint();
      await cache.get(key);
      const end = process.hrtime.bigint();

      const durationMs = Number(end - start) / 1_000_000; // Convert ns to ms
      expect(durationMs).toBeLessThan(1); // Sub-millisecond response
    });

    it('should handle concurrent requests efficiently', async () => {
      const requests = Array.from({ length: 100 }, (_, i) => ({
        ...mockRequest,
        classificationCode: `L${i + 1}`,
      }));

      const start = process.hrtime.bigint();
      await Promise.all(
        requests.map((req) =>
          cacheMiddleware.calculateRate(req, async () => ({
            baseRate: 25.5,
            total: 25.5,
            penalties: [],
            allowances: [],
            breakdown: { base: 25.5, penalties: 0, allowances: 0 },
            metadata: {
              calculatedAt: new Date(),
              effectiveDate: new Date('2025-01-29'),
              source: 'fairwork',
            },
          })),
        ),
      );
      const end = process.hrtime.bigint();

      const durationMs = Number(end - start) / 1_000_000;
      const avgRequestMs = durationMs / requests.length;
      expect(avgRequestMs).toBeLessThan(5); // Average 5ms per request
    });

    it('should maintain performance under load', async () => {
      const iterations = 1000;
      const timings: number[] = [];

      for (let i = 0; i < iterations; i++) {
        const start = process.hrtime.bigint();
        await cache.set(`perf-key-${i}`, { data: `value-${i}` });
        const end = process.hrtime.bigint();
        timings.push(Number(end - start) / 1_000_000);
      }

      const avgTime = timings.reduce((a, b) => a + b) / timings.length;
      const p95Time = timings.sort((a, b) => a - b)[Math.floor(iterations * 0.95)];

      expect(avgTime).toBeLessThan(2); // Average under 2ms
      expect(p95Time).toBeLessThan(5); // 95th percentile under 5ms
    });
  });

  describe('Memory Usage', () => {
    it('should maintain stable memory usage under load', async () => {
      const initialMemory = process.memoryUsage().heapUsed;
      const largeDataSet = Array.from({ length: 10000 }, (_, i) => ({
        key: `key-${i}`,
        value: { data: `value-${i}`.repeat(100) }, // Create significant data size
      }));

      // Perform cache operations
      await Promise.all(largeDataSet.map(({ key, value }) => cache.set(key, value)));

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncreaseMB = (finalMemory - initialMemory) / 1024 / 1024;

      // Memory increase should be reasonable for the data size
      expect(memoryIncreaseMB).toBeLessThan(50); // Less than 50MB increase
    });
  });

  describe('Cache Efficiency', () => {
    it('should maintain high hit rate for repeated access', async () => {
      const iterations = 1000;
      const hitRates: boolean[] = [];

      // Prime cache with initial data
      await cache.set('efficiency-test', { data: 'test' });

      for (let i = 0; i < iterations; i++) {
        const result = await cache.get('efficiency-test');
        hitRates.push(result !== null);

        // Simulate occasional cache misses
        if (i % 100 === 0) {
          await cache.delete('efficiency-test');
          await cache.set('efficiency-test', { data: 'test' });
        }
      }

      const hitRate = hitRates.filter(Boolean).length / hitRates.length;
      expect(hitRate).toBeGreaterThan(0.95); // >95% hit rate
    });

    it('should handle cache eviction gracefully', async () => {
      const largeValue = Buffer.alloc(1024 * 1024).toString(); // 1MB string
      const keys = Array.from({ length: 1000 }, (_, i) => `eviction-${i}`);

      // Fill cache with large values
      await Promise.all(keys.map((key) => cache.set(key, { data: largeValue })));

      // Verify cache eviction
      const results = await Promise.all(keys.map((key) => cache.get(key)));
      const evictionRate = results.filter((r) => r === null).length / results.length;

      // Some entries should be evicted due to memory pressure
      expect(evictionRate).toBeGreaterThan(0);
      expect(evictionRate).toBeLessThan(0.5); // But not too many
    });
  });
});
