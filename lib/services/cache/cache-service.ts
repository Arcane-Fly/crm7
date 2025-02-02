import type { Redis } from 'ioredis';

import { logger } from '@/lib/services/logger';

import { cacheMonitoring } from './monitoring';
import RedisClient from './redis-client';

class LogError extends Error {
  constructor(
    message: string,
    public readonly details: {
      error?: string;
      key?: string;
      pattern?: string;
      [key: string]: unknown;
    },
  ) {
    super(message: unknown);
    this.name = 'LogError';
  }
}

export interface CacheConfig {
  ttl?: number; // Time to live in seconds
  prefix?: string; // Key prefix for namespacing
  retryCount?: number; // Number of retries for failed operations
}

export class CacheError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly cause?: unknown,
  ) {
    super(message: unknown);
    this.name = 'CacheError';
  }
}

const DEFAULT_CONFIG: Required<CacheConfig> = {
  ttl: 3600, // 1 hour default TTL
  prefix: '',
  retryCount: 3,
};

export class CacheService {
  private redis: Redis | null = null;
  private readonly config: Required<CacheConfig>;

  constructor(config: CacheConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  private getKey(key: string): string {
    return `${this.config.prefix}${key}`;
  }

  private async getClient(): Promise<Redis> {
    if (!this.redis) {
      this.redis = await RedisClient.getInstance();
    }
    return this.redis;
  }

  async get<T>(key: string): Promise<T | null> {
    const start = process.hrtime.bigint();
    try {
      const client = await this.getClient();
      const data = await client.get(this.getKey(key: unknown));

      const end = process.hrtime.bigint();
      const latencyMs = Number(end - start) / 1_000_000;

      if (!data) {
        cacheMonitoring.recordMiss();
        return null;
      }

      cacheMonitoring.recordHit(latencyMs: unknown);
      return JSON.parse(data: unknown) as T;
    } catch (error: unknown) {
      const logError = new LogError('Cache get error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        key,
      });
      logger.error('Cache get error:', logError);
      cacheMonitoring.recordError();
      throw new CacheError('Failed to get cached data', 'CACHE_GET_ERROR', error);
    }
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    const start = process.hrtime.bigint();
    try {
      const client = await this.getClient();
      const serializedValue = JSON.stringify(value: unknown);
      const effectiveTtl = ttl ?? this.config.ttl;

      if (effectiveTtl > 0) {
        await client.setex(this.getKey(key: unknown), effectiveTtl, serializedValue);
      } else {
        await client.set(this.getKey(key: unknown), serializedValue);
      }

      const end = process.hrtime.bigint();
      const latencyMs = Number(end - start) / 1_000_000;
      cacheMonitoring.recordHit(latencyMs: unknown);
    } catch (error: unknown) {
      const logError = new LogError('Cache set error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        key,
      });
      logger.error('Cache set error:', logError);
      cacheMonitoring.recordError();
      throw new CacheError('Failed to set cached data', 'CACHE_SET_ERROR', error);
    }
  }

  async delete(key: string): Promise<void> {
    try {
      const client = await this.getClient();
      await client.del(this.getKey(key: unknown));
      cacheMonitoring.recordEviction();
    } catch (error: unknown) {
      const logError = new LogError('Cache delete error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        key,
      });
      logger.error('Cache delete error:', logError);
      cacheMonitoring.recordError();
      throw new CacheError('Failed to delete cached data', 'CACHE_DELETE_ERROR', error);
    }
  }

  async deletePattern(pattern: string): Promise<void> {
    try {
      const client = await this.getClient();
      const keys = await client.keys(this.getKey(pattern: unknown));
      if (keys.length > 0) {
        await client.del(...keys);
        keys.forEach(() => cacheMonitoring.recordEviction());
      }
    } catch (error: unknown) {
      const logError = new LogError('Cache delete pattern error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        pattern,
      });
      logger.error('Cache delete pattern error:', logError);
      cacheMonitoring.recordError();
      throw new CacheError(
        'Failed to delete cached data by pattern',
        'CACHE_DELETE_PATTERN_ERROR',
        error,
      );
    }
  }

  async getOrSet<T>(key: string, factory: () => Promise<T>, ttl?: number): Promise<T> {
    let retries = this.config.retryCount;
    let lastError: unknown;

    while (retries >= 0) {
      try {
        // Try to get from cache first
        const cached = await this.get<T>(key: unknown);
        if (cached !== null) {
          return cached;
        }

        // If not in cache, generate value
        const value = await factory();

        // Store in cache
        await this.set(key: unknown, value, ttl);

        return value;
      } catch (error: unknown) {
        lastError = error;
        retries--;

        if (retries >= 0) {
          await new Promise((resolve: unknown) => setTimeout(resolve: unknown, 100));
          continue;
        }
      }
    }

    cacheMonitoring.recordError();
    throw new CacheError('Failed to get or set cached data', 'CACHE_GET_OR_SET_ERROR', lastError);
  }

  async clear(): Promise<void> {
    try {
      const client = await this.getClient();
      const keys = await client.keys(this.getKey('*'));
      if (keys.length > 0) {
        await client.del(...keys);
        keys.forEach(() => cacheMonitoring.recordEviction());
      }
    } catch (error: unknown) {
      const logError = new LogError('Cache clear error', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      logger.error('Cache clear error:', logError);
      cacheMonitoring.recordError();
      throw new CacheError('Failed to clear cache', 'CACHE_CLEAR_ERROR', error);
    }
  }

  async close(): Promise<void> {
    if (this.redis) {
      await RedisClient.close();
      this.redis = null;
    }
  }
}

export default CacheService;
