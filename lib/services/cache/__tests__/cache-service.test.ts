import { logger } from '@/lib/services/logger';
import RedisMock from 'ioredis-mock';
import { mock } from 'jest-mock-extended';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CacheError, CacheService } from '../cache-service';

vi.mock('@/lib/services/logger');
vi.mock('../redis-client', () => ({
  __esModule: true,
  default: class {
    private static instance = null;
    public static async getInstance() {
      if (!this.instance) {
        this.instance = new RedisMock();
      }
      return this.instance;
    }
    public static async close() {
      if (this.instance) {
        await this.instance.quit();
        this.instance = null;
      }
    }
  },
}));

describe('CacheService', () => {
  let cache: CacheService;
  let redis: RedisMock;

  beforeEach(async () => {
    redis = new RedisMock();
    cache = new CacheService({ prefix: 'test:', ttl: 3600 });
    await cache['getClient']();
  });

  afterEach(async () => {
    await cache.close();
    await redis.flushall();
  });

  describe('Basic Operations', () => {
    it('should set and get a value', async () => {
      const key = 'test-key';
      const value = { foo: 'bar' };
      await cache.set(key, value);
      const result = await cache.get(key);
      expect(result).toEqual(value);
    });

    it('should return null for non-existent key', async () => {
      const result = await cache.get('non-existent');
      expect(result).toBeNull();
    });

    it('should delete a value', async () => {
      const key = 'test-key';
      const value = { foo: 'bar' };

      await cache.set(key, value);
      await cache.delete(key);

      const result = await cache.get(key);
      expect(result).toBeNull();
    });

    it('should clear all values with matching prefix', async () => {
      await cache.set('test1', 'value1');
      await cache.set('test2', 'value2');

      await cache.clear();

      const result1 = await cache.get('test1');
      const result2 = await cache.get('test2');

      expect(result1).toBeNull();
      expect(result2).toBeNull();
    });
  });

  describe('TTL Functionality', () => {
    it('should respect TTL when setting values', async () => {
      const key = 'ttl-test';
      const value = { foo: 'bar' };
      const ttl = 1; // 1 second

      await cache.set(key, value, ttl);

      // Value should exist initially
      let result = await cache.get(key);
      expect(result).toEqual(value);

      // Wait for TTL to expire
      await new Promise(resolve => setTimeout(resolve, 1100));

      // Value should be gone after TTL
      result = await cache.get(key);
      expect(result).toBeNull();
    });
  });

  describe('Error Handling', () => {
    it('should handle JSON parse errors', async () => {
      // Manually set invalid JSON
      await redis.set('test:invalid-json', 'invalid{json');

      await expect(cache.get('invalid-json')).rejects.toThrow(CacheError);
      expect(logger.error).toHaveBeenCalled();
    });

    it('should handle Redis connection errors', async () => {
      const mockRedis = mock<Redis>();
      mockRedis.get.mockRejectedValue(new Error('Connection failed'));

      // We need to access the private redis property for testing
      (cache as any).redis = mockRedis;

      await expect(cache.get('test-key')).rejects.toThrow(CacheError);
      expect(logger.error).toHaveBeenCalled();
    });
  });
});
