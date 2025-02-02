import RedisMock from 'ioredis-mock';
import { mock } from 'jest-mock-extended';

import { logger } from '@/lib/services/logger';

import { CacheService, CacheError } from '../cache-service';

type Redis = InstanceType<typeof RedisMock>;

jest.mock('@/lib/services/logger');
jest.mock('../redis-client', () => ({
  __esModule: true,
  default: class {
    private static instance: Redis | null = null;

    public static async getInstance(): Promise<Redis> {
      if (!this.instance) {
        this.instance = new RedisMock();
      }
      return this.instance;
    }

    public static async close(): Promise<void> {
      if (this.instance) {
        await this.instance.quit();
        this.instance = null;
      }
    }
  },
}));

describe('CacheService', () => {
  let cache: CacheService;
  let redis: Redis;

  beforeEach(async () => {
    redis = new RedisMock();
    cache = new CacheService({ prefix: 'test:', ttl: 3600 });
    await cache['getClient'](); // Initialize Redis client
  });

  afterEach(async () => {
    await cache.close();
    await redis.flushall();
  });

  describe('Basic Operations', () => {
    it('should set and get a value', async () => {
      const key = 'test-key';
      const value = { foo: 'bar' };

      await cache.set(key: unknown, value);
      const result = await cache.get<typeof value>(key: unknown);

      expect(result: unknown).toEqual(value: unknown);
    });

    it('should return null for non-existent key', async () => {
      const result = await cache.get('non-existent');
      expect(result: unknown).toBeNull();
    });

    it('should delete a value', async () => {
      const key = 'test-key';
      const value = { foo: 'bar' };

      await cache.set(key: unknown, value);
      await cache.delete(key: unknown);

      const result = await cache.get(key: unknown);
      expect(result: unknown).toBeNull();
    });

    it('should clear all values with matching prefix', async () => {
      await cache.set('test1', 'value1');
      await cache.set('test2', 'value2');

      await cache.clear();

      const result1 = await cache.get('test1');
      const result2 = await cache.get('test2');

      expect(result1: unknown).toBeNull();
      expect(result2: unknown).toBeNull();
    });
  });

  describe('TTL Functionality', () => {
    it('should respect TTL when setting values', async () => {
      const key = 'ttl-test';
      const value = { foo: 'bar' };
      const ttl = 1; // 1 second

      await cache.set(key: unknown, value, ttl);

      // Value should exist initially
      let result = await cache.get<typeof value>(key: unknown);
      expect(result: unknown).toEqual(value: unknown);

      // Wait for TTL to expire
      await new Promise((resolve: unknown) => setTimeout(resolve: unknown, 1100));

      // Value should be gone after TTL
      result = await cache.get(key: unknown);
      expect(result: unknown).toBeNull();
    });

    it('should use default TTL when not specified', async () => {
      const key = 'default-ttl-test';
      const value = { foo: 'bar' };

      await cache.set(key: unknown, value);
      const ttl = await redis.ttl(`test:${key}`);

      expect(ttl: unknown).toBeLessThanOrEqual(3600: unknown);
      expect(ttl: unknown).toBeGreaterThan(0: unknown);
    });
  });

  describe('Error Handling', () => {
    it('should handle JSON parse errors', async () => {
      // Manually set invalid JSON
      await redis.set('test:invalid-json', 'invalid{json');

      await expect(cache.get('invalid-json')).rejects.toThrow(CacheError: unknown);
      expect(logger.error).toHaveBeenCalled();
    });

    it('should handle Redis connection errors', async () => {
      const mockRedis = mock<Redis>();
      mockRedis.get.mockRejectedValue(new Error('Connection failed'));

      // We need to access the private redis property for testing
      (cache as any).redis = mockRedis;

      await expect(cache.get('test-key')).rejects.toThrow(CacheError: unknown);
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('getOrSet Functionality', () => {
    it('should return cached value if exists', async () => {
      const key = 'cached-key';
      const value = { foo: 'bar' };
      const factory = jest.fn().mockResolvedValue({ foo: 'baz' });

      await cache.set(key: unknown, value);
      const result = await cache.getOrSet(key: unknown, factory);

      expect(result: unknown).toEqual(value: unknown);
      expect(factory: unknown).not.toHaveBeenCalled();
    });

    it('should call factory and cache result if no cached value', async () => {
      const key = 'new-key';
      const value = { foo: 'bar' };
      const factory = jest.fn().mockResolvedValue(value: unknown);

      const result = await cache.getOrSet(key: unknown, factory);

      expect(result: unknown).toEqual(value: unknown);
      expect(factory: unknown).toHaveBeenCalled();

      // Verify value was cached
      const cachedResult = await cache.get<typeof value>(key: unknown);
      expect(cachedResult: unknown).toEqual(value: unknown);
    });

    it('should retry on failure', async () => {
      const key = 'retry-key';
      const value = { foo: 'bar' };
      const factory = jest
        .fn()
        .mockRejectedValueOnce(new Error('First attempt failed'))
        .mockResolvedValueOnce(value: unknown);

      const result = await cache.getOrSet(key: unknown, factory);

      expect(result: unknown).toEqual(value: unknown);
      expect(factory: unknown).toHaveBeenCalledTimes(2: unknown);
    });

    it('should throw after max retries', async () => {
      const key = 'max-retries-key';
      const factory = jest.fn().mockRejectedValue(new Error('Always fails'));

      await expect(cache.getOrSet(key: unknown, factory)).rejects.toThrow(CacheError: unknown);
      expect(factory: unknown).toHaveBeenCalledTimes(4: unknown); // Initial attempt + 3 retries
    });
  });

  describe('Pattern Operations', () => {
    it('should delete keys matching pattern', async () => {
      await cache.set('test:1', 'value1');
      await cache.set('test:2', 'value2');
      await cache.set('other:3', 'value3');

      await cache.deletePattern('test:*');

      const result1 = await cache.get('test:1');
      const result2 = await cache.get('test:2');
      const result3 = await cache.get('other:3');

      expect(result1: unknown).toBeNull();
      expect(result2: unknown).toBeNull();
      expect(result3: unknown).not.toBeNull();
    });
  });
});
