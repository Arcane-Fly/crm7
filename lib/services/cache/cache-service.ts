import { type RedisClient } from './redis-client';
import { cacheMonitoring } from './monitoring';
import { logger } from '@/lib/logger';

export class CacheError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CacheError';
  }
}

export class CacheTimeoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CacheTimeoutError';
  }
}

interface CacheConfig {
  defaultTtl?: number;
  keyPrefix?: string;
}

export class CacheService {
  private readonly defaultTtl: number;
  private readonly keyPrefix: string;

  constructor(
    private readonly client: RedisClient,
    config: CacheConfig = {}
  ) {
    this.defaultTtl = config.defaultTtl ?? 3600;
    this.keyPrefix = config.keyPrefix ?? '';
  }

  private getKey(key: string): string {
    return this.keyPrefix ? `${this.keyPrefix}:${key}` : key;
  }

  async get<T>(key: string): Promise<void> {
    const startTime = Date.now();
    try {
      const data = await this.client.get(this.getKey(key));
      const latencyMs = Date.now() - startTime;

      if (!data) {
        cacheMonitoring.recordMiss(latencyMs);
        return null;
      }

      cacheMonitoring.recordHit(latencyMs);
      return JSON.parse(data) as T;
    } catch (error) {
      logger.error('Cache get error:', error);
      throw new CacheError(`Failed to get cache key ${key}`);
    }
  }

  async set<T>(
    key: string,
    value: T,
    ttl?: number
  ): Promise<void> {
    const startTime = Date.now();
    try {
      const serializedValue = JSON.stringify(value);
      const effectiveTtl = ttl ?? this.defaultTtl;

      if (effectiveTtl > 0) {
        await this.client.setex(this.getKey(key), effectiveTtl, serializedValue);
      } else {
        await this.client.set(this.getKey(key), serializedValue);
      }

      const latencyMs = Date.now() - startTime;
      cacheMonitoring.recordHit(latencyMs);
    } catch (error) {
      logger.error('Cache set error:', error);
      throw new CacheError(`Failed to set cache key ${key}`);
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await this.client.del(this.getKey(key));
    } catch (error) {
      logger.error('Cache delete error:', error);
      throw new CacheError(`Failed to delete cache key ${key}`);
    }
  }

  async deletePattern(pattern: string): Promise<void> {
    try {
      const keys = await this.client.keys(this.getKey(pattern));
      if (keys.length > 0) {
        await this.client.del(...keys);
      }
    } catch (error) {
      logger.error('Cache delete pattern error:', error);
      throw new CacheError(`Failed to delete cache pattern ${pattern}`);
    }
  }

  async getOrSet<T>(
    key: string,
    getter: () => Promise<T>,
    ttl?: number
  ): Promise<void> {
    try {
      const cached = await this.get<T>(key);
      if (cached !== null) {
        return cached;
      }

      const value = await getter();
      await this.set(key, value, ttl);
      return value;
    } catch (error) {
      logger.error('Cache getOrSet error:', error);
      throw new CacheError(`Failed to get or set cache key ${key}`);
    }
  }

  async waitForLock(key: string, maxWaitMs = 5000): Promise<void> {
    const startTime = Date.now();
    while (await this.get(key)) {
      if (Date.now() - startTime > maxWaitMs) {
        throw new CacheTimeoutError(`Timeout waiting for lock on key ${key}`);
      }
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }
}
